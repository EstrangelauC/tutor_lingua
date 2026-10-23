import {
  ErreurApi,
  type CodeErreur,
  type CreerSessionRequest,
  type Feedback,
  type Replique,
  type TourCamille,
} from "@camille/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";
import { arreterDeParler, parler } from "../voix/parole";

export type { Replique };

/** O que está a acontecer agora: arranque, à espera da Camille, a gerar o feedback ou nada (vez do aluno). */
export type Activite = "demarrage" | "reponse" | "evaluation" | null;

/** Erros a mostrar ao aluno: os da API e os da gravação. A app traduz cada um. */
export type ErreurSession = CodeErreur | "trop_court" | "trop_court_maintenir";

export interface EtatSession {
  sessionId: string | null;
  repliques: Replique[];
  echange: number;
  maxEchanges: number;
  terminee: boolean;
  activite: Activite;
  /** A Camille está a ler a última fala em voz alta. */
  parle: boolean;
  /** O que mostrar ao aluno quando um pedido falha. */
  erreur: ErreurSession | null;
  /** Quando a Camille abriu a sessão (ms), para guardar a duração no histórico. */
  debut: number | null;
  /** Número da tentativa de arranque em curso, a partir da segunda (a API estava a acordar). */
  tentative: number | null;
}

/** A API num plano gratuito adormece: a primeira chamada pode esgotar o tempo. Insiste. */
export const TENTATIVES_DEMARRAGE = 3;
const PAUSE_ENTRE_TENTATIVES_MS = 1_500;

/**
 * Quando um envio esgota o tempo do lado da app, a Camille pode ainda estar a responder: a app
 * consulta o estado da sessão de tantos em tantos segundos, até este limite, e recupera a fala.
 */
export const CONSULTATIONS_MAX = 12;
const PAUSE_ENTRE_CONSULTATIONS_MS = 5_000;

const ETAT_INITIAL: EtatSession = {
  sessionId: null,
  repliques: [],
  echange: 0,
  maxEchanges: 8,
  terminee: false,
  activite: null,
  parle: false,
  erreur: null,
  debut: null,
  tentative: null,
};

function code(erreur: unknown): ErreurSession {
  return erreur instanceof ErreurApi ? erreur.code : "inconnu";
}

/** A Camille pode ter acabado por responder do lado da API: vale a pena ir ver. */
function vautRecuperation(erreur: unknown): boolean {
  return (
    erreur instanceof ErreurApi && (erreur.code === "delai" || erreur.code === "session_occupee")
  );
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Options {
  /** Velocidade de leitura das falas (1 = normal do sistema). */
  debit: number;
  /**
   * Chamado quando a Camille acaba de ler uma fala sem ser interrompida (usado pelo modo
   * mãos-livres para abrir o microfone). `terminee` diz se essa era a última fala da sessão.
   */
  onFinParole?: (terminee: boolean) => void;
}

/** Conduz uma sessão com a Camille através da API e lê as falas dela em voz alta. */
export function useSessionCamille(config: CreerSessionRequest, options: Options) {
  const [etat, setEtat] = useState<EtatSession>(ETAT_INITIAL);

  // As opções são lidas quando a fala acaba, não quando o pedido partiu: ficam sempre atuais.
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });
  // Em desenvolvimento, o React monta o ecrã duas vezes: só se cria uma sessão.
  const demarrageEnCours = useRef(false);

  const dire = useCallback(async (texte: string, terminee: boolean) => {
    setEtat((e) => ({ ...e, parle: true }));
    const fin = await parler(texte, optionsRef.current.debit);
    setEtat((e) => ({ ...e, parle: false }));
    if (fin === "fin") {
      optionsRef.current.onFinParole?.(terminee);
    }
  }, []);

  /** Junta a fala da Camille (e a resposta do aluno, se veio de uma gravação) e lê-a. */
  const appliquerTour = useCallback(
    (tour: TourCamille, texteEleve?: string) => {
      setEtat((e) => ({
        ...e,
        sessionId: tour.sessionId,
        repliques: [
          ...e.repliques,
          ...(texteEleve === undefined ? [] : [{ role: "eleve" as const, texte: texteEleve }]),
          { role: "camille", texte: tour.camille },
        ],
        echange: tour.echange,
        maxEchanges: tour.maxEchanges,
        terminee: tour.terminee,
        activite: null,
      }));
      void dire(tour.camille, tour.terminee);
    },
    [dire],
  );

  const demarrer = useCallback(async () => {
    if (demarrageEnCours.current) return;
    demarrageEnCours.current = true;
    setEtat({ ...ETAT_INITIAL, activite: "demarrage" });
    try {
      for (let tentative = 1; ; tentative++) {
        try {
          const tour = await api.creerSession(config);
          setEtat((e) => ({ ...e, debut: Date.now(), tentative: null }));
          appliquerTour(tour);
          return;
        } catch (erreur) {
          const temporaire = erreur instanceof ErreurApi && erreur.temporaire;
          if (temporaire && tentative < TENTATIVES_DEMARRAGE) {
            setEtat((e) => ({ ...e, tentative: tentative + 1 }));
            await pause(PAUSE_ENTRE_TENTATIVES_MS);
            continue;
          }
          setEtat((e) => ({ ...e, activite: null, tentative: null, erreur: code(erreur) }));
          return;
        }
      }
    } finally {
      demarrageEnCours.current = false;
    }
  }, [config, appliquerTour]);

  /**
   * Depois de um tempo esgotado: espera que a API deixe de estar ocupada e, se a troca avançou
   * entretanto, substitui a conversa pela da API e lê a fala recuperada. Devolve false se não
   * houve nada a recuperar.
   */
  const recuperer = async (sessionId: string, echangeAvant: number): Promise<boolean> => {
    for (let i = 0; i < CONSULTATIONS_MAX; i++) {
      try {
        const actuel = await api.consulter(sessionId);
        if (actuel.occupee) {
          await pause(PAUSE_ENTRE_CONSULTATIONS_MS);
          continue;
        }
        if (actuel.echange <= echangeAvant) return false;
        setEtat((e) => ({
          ...e,
          repliques: actuel.transcription,
          echange: actuel.echange,
          maxEchanges: actuel.maxEchanges,
          terminee: actuel.terminee,
          activite: null,
          erreur: null,
        }));
        void dire(actuel.camille, actuel.terminee);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  /** Envia uma resposta escrita; devolve false se falhar, para a app manter o texto. */
  const envoyer = async (texte: string): Promise<boolean> => {
    const { sessionId, echange } = etat;
    if (!sessionId) return false;
    setEtat((e) => ({
      ...e,
      repliques: [...e.repliques, { role: "eleve", texte }],
      activite: "reponse",
      erreur: null,
    }));
    try {
      appliquerTour(await api.envoyerMessage(sessionId, texte));
      return true;
    } catch (erreur) {
      if (vautRecuperation(erreur) && (await recuperer(sessionId, echange))) return true;
      setEtat((e) => ({
        ...e,
        repliques: e.repliques.slice(0, -1),
        activite: null,
        erreur: code(erreur),
      }));
      return false;
    }
  };

  /** Envia uma resposta gravada (FormData com o campo "audio"). */
  const envoyerAudio = async (audio: FormData): Promise<boolean> => {
    const { sessionId, echange } = etat;
    if (!sessionId) return false;
    setEtat((e) => ({ ...e, activite: "reponse", erreur: null }));
    try {
      const tour = await api.envoyerAudio(sessionId, audio);
      appliquerTour(tour, tour.texteEleve);
      return true;
    } catch (erreur) {
      if (vautRecuperation(erreur) && (await recuperer(sessionId, echange))) return true;
      setEtat((e) => ({ ...e, activite: null, erreur: code(erreur) }));
      return false;
    }
  };

  /** Lê outra vez a última fala da Camille. */
  const rejouer = () => {
    const derniere = [...etat.repliques].reverse().find((r) => r.role === "camille");
    if (derniere && !etat.parle) {
      void dire(derniere.texte, etat.terminee);
    }
  };

  /** Pede o feedback; devolve null se falhar. */
  const terminer = async (): Promise<Feedback | null> => {
    const { sessionId } = etat;
    if (!sessionId) return null;
    arreterDeParler();
    setEtat((e) => ({ ...e, activite: "evaluation", erreur: null }));
    try {
      const feedback = await api.terminer(sessionId);
      setEtat((e) => ({ ...e, activite: null, terminee: true }));
      return feedback;
    } catch (erreur) {
      setEtat((e) => ({ ...e, activite: null, erreur: code(erreur) }));
      return null;
    }
  };

  const signalerErreur = (erreur: ErreurSession | null) => setEtat((e) => ({ ...e, erreur }));

  return {
    etat,
    demarrer,
    envoyer,
    envoyerAudio,
    rejouer,
    terminer,
    interrompre: arreterDeParler,
    signalerErreur,
  };
}
