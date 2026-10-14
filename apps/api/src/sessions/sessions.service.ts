import { randomUUID } from "node:crypto";
import { MAX_ECHANGES, type Feedback, type TourCamille } from "@camille/shared";
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  type OnModuleDestroy,
} from "@nestjs/common";
import {
  MOTEUR_CAMILLE,
  type ContexteSession,
  type Conversation,
  type MoteurCamille,
} from "../camille/camille.types";

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

  constructor(@Inject(MOTEUR_CAMILLE) private readonly moteur: MoteurCamille) {
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

  envoyer(id: string, texte: string): Promise<TourCamille> {
    const session = this.obtenir(id);
    return this.exclusif(session, async () => {
      if (session.terminee) {
        throw new ConflictException("A sessão já terminou: pede o feedback.");
      }
      const derniere = session.echange + 1 >= MAX_ECHANGES;
      const camille = await this.moteur.repondre(session.conversation, texte, derniere);
      session.conversation.transcription.push(
        { role: "eleve", texte },
        { role: "camille", texte: camille },
      );
      session.echange += 1;
      session.terminee = derniere;
      return this.tour(session, camille);
    });
  }

  terminer(id: string): Promise<Feedback> {
    const session = this.obtenir(id);
    return this.exclusif(session, async () => {
      if (session.feedback) {
        return session.feedback;
      }
      if (session.echange === 0) {
        throw new ConflictException("Ainda não há respostas para avaliar.");
      }
      const feedback = await this.moteur.evaluer(session.conversation);
      session.terminee = true;
      session.feedback = feedback;
      return feedback;
    });
  }

  private obtenir(id: string): Session {
    const session = this.sessions.get(id);
    if (!session) {
      throw new NotFoundException("Sessão não encontrada.");
    }
    session.derniereActivite = Date.now();
    return session;
  }

  private async exclusif<T>(session: Session, action: () => Promise<T>): Promise<T> {
    if (session.occupee) {
      throw new ConflictException("A Camille ainda está a responder ao pedido anterior.");
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
