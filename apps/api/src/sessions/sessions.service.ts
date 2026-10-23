import { randomUUID } from "node:crypto";
import {
  MAX_ECHANGES,
  type EtatSession,
  type Feedback,
  type TourAudio,
  type TourCamille,
} from "@camille/shared";
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  type OnModuleDestroy,
} from "@nestjs/common";
import {
  MOTEUR_CAMILLE,
  type ContexteSession,
  type Conversation,
  type MoteurCamille,
} from "../camille/camille.types";
import { erreurApi } from "../common/erreur-api";
import { TRANSCRIPTEUR, type AudioEleve, type Transcripteur } from "../transcription/transcripteur";

interface Session {
  id: string;
  conversation: Conversation;
  echange: number;
  terminee: boolean;
  feedback?: Feedback;
  /** Impede dois pedidos em simultâneo sobre a mesma sessão. */
  occupee: boolean;
  derniereActivite: number;
}

/** Sessões inativas há mais do que isto são apagadas. */
const DUREE_VIE_MS = 2 * 60 * 60 * 1000;

/** Sessões em memória: perdem-se quando a API reinicia. */
@Injectable()
export class SessionsService implements OnModuleDestroy {
  private readonly sessions = new Map<string, Session>();
  private readonly nettoyage: NodeJS.Timeout;

  constructor(
    @Inject(MOTEUR_CAMILLE) private readonly moteur: MoteurCamille,
    @Inject(TRANSCRIPTEUR) private readonly transcripteur: Transcripteur,
  ) {
    this.nettoyage = setInterval(() => this.purger(), 10 * 60 * 1000);
    this.nettoyage.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.nettoyage);
  }

  async creer(contexte: ContexteSession): Promise<TourCamille> {
    const session: Session = {
      id: randomUUID(),
      conversation: { contexte, transcription: [], messagesModele: [] },
      echange: 0,
      terminee: false,
      occupee: false,
      derniereActivite: Date.now(),
    };
    const camille = await this.moteur.ouvrir(session.conversation);
    session.conversation.transcription.push({ role: "camille", texte: camille });
    this.sessions.set(session.id, session);
    return this.tour(session, camille);
  }

  /** Estado atual, sem tocar na conversa: pode ser lido mesmo com a sessão ocupada. */
  consulter(id: string): EtatSession {
    const session = this.obtenir(id);
    const { transcription } = session.conversation;
    const derniere = transcription.findLast((r) => r.role === "camille");
    return {
      ...this.tour(session, derniere?.texte ?? ""),
      transcription: [...transcription],
      occupee: session.occupee,
    };
  }

  envoyer(id: string, texte: string): Promise<TourCamille> {
    const session = this.obtenir(id);
    return this.exclusif(session, () => this.avancer(session, texte));
  }

  /** Transcreve a gravação e continua a conversa com esse texto. */
  envoyerAudio(id: string, audio: AudioEleve): Promise<TourAudio> {
    const session = this.obtenir(id);
    return this.exclusif(session, async () => {
      this.verifierEnCours(session);
      const texteEleve = await this.transcripteur.transcrire(audio);
      if (texteEleve === "") {
        throw new UnprocessableEntityException(
          erreurApi("audio_vide", "A transcrição da gravação veio vazia."),
        );
      }
      return { ...(await this.avancer(session, texteEleve)), texteEleve };
    });
  }

  terminer(id: string): Promise<Feedback> {
    const session = this.obtenir(id);
    return this.exclusif(session, async () => {
      if (session.feedback) {
        return session.feedback;
      }
      if (session.echange === 0) {
        throw new ConflictException(
          erreurApi("sans_reponse", "Ainda não há respostas para avaliar."),
        );
      }
      const feedback = await this.moteur.evaluer(session.conversation);
      session.terminee = true;
      session.feedback = feedback;
      return feedback;
    });
  }

  /** Uma troca: resposta do aluno → fala da Camille. Chamar com o bloqueio da sessão. */
  private async avancer(session: Session, texte: string): Promise<TourCamille> {
    this.verifierEnCours(session);
    const derniere = session.echange + 1 >= MAX_ECHANGES;
    const camille = await this.moteur.repondre(session.conversation, texte, derniere);
    session.conversation.transcription.push(
      { role: "eleve", texte },
      { role: "camille", texte: camille },
    );
    session.echange += 1;
    session.terminee = derniere;
    return this.tour(session, camille);
  }

  private verifierEnCours(session: Session): void {
    if (session.terminee) {
      throw new ConflictException(
        erreurApi("session_terminee", "A sessão já terminou: pede o feedback."),
      );
    }
  }

  private obtenir(id: string): Session {
    const session = this.sessions.get(id);
    if (!session) {
      throw new NotFoundException(erreurApi("session_introuvable", "Sessão não encontrada."));
    }
    session.derniereActivite = Date.now();
    return session;
  }

  private async exclusif<T>(session: Session, action: () => Promise<T>): Promise<T> {
    if (session.occupee) {
      throw new ConflictException(
        erreurApi("session_occupee", "A Camille ainda está a responder ao pedido anterior."),
      );
    }
    session.occupee = true;
    try {
      return await action();
    } finally {
      session.occupee = false;
    }
  }

  private tour(session: Session, camille: string): TourCamille {
    return {
      sessionId: session.id,
      camille,
      echange: session.echange,
      maxEchanges: MAX_ECHANGES,
      terminee: session.terminee,
    };
  }

  private purger(): void {
    const limite = Date.now() - DUREE_VIE_MS;
    for (const [id, session] of this.sessions) {
      if (session.derniereActivite < limite && !session.occupee) {
        this.sessions.delete(id);
      }
    }
  }
}
