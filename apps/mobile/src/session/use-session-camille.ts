import {
  ErreurApi,
  type CreerSessionRequest,
  type Feedback,
  type TourCamille,
} from "@camille/shared";
import { useCallback, useState } from "react";
import { api } from "../api";

export interface Replique {
  role: "camille" | "eleve";
  texte: string;
}

/** O que está a acontecer agora: arranque, à espera da Camille, a gerar o feedback ou nada (vez do aluno). */
export type Activite = "demarrage" | "reponse" | "evaluation" | null;

export interface EtatSession {
  sessionId: string | null;
  repliques: Replique[];
  echange: number;
  maxEchanges: number;
  terminee: boolean;
  activite: Activite;
  /** Mensagem a mostrar ao aluno quando um pedido falha. */
  erreur: string | null;
}

const ETAT_INITIAL: EtatSession = {
  sessionId: null,
  repliques: [],
  echange: 0,
  maxEchanges: 8,
  terminee: false,
  activite: null,
  erreur: null,
};

function message(erreur: unknown): string {
  if (erreur instanceof ErreurApi) {
    return erreur.status === 0
      ? "Sem ligação à API. Confirma que a API está a correr e que o telemóvel está na mesma rede."
      : erreur.message;
  }
  return "Algo correu mal. Tenta outra vez.";
}

/** Conduz uma sessão com a Camille através da API. */
export function useSessionCamille(config: CreerSessionRequest) {
  const [etat, setEtat] = useState<EtatSession>(ETAT_INITIAL);

  const appliquerTour = (tour: TourCamille) =>
    setEtat((e) => ({
      ...e,
      sessionId: tour.sessionId,
      repliques: [...e.repliques, { role: "camille", texte: tour.camille }],
      echange: tour.echange,
      maxEchanges: tour.maxEchanges,
      terminee: tour.terminee,
      activite: null,
    }));

  const demarrer = useCallback(async () => {
    setEtat({ ...ETAT_INITIAL, activite: "demarrage" });
    try {
      appliquerTour(await api.creerSession(config));
    } catch (erreur) {
      setEtat((e) => ({ ...e, activite: null, erreur: message(erreur) }));
    }
  }, [config]);

  /** Envia a resposta; devolve false se falhar, para a app manter o texto escrito. */
  const envoyer = async (texte: string): Promise<boolean> => {
    const { sessionId } = etat;
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
      setEtat((e) => ({
        ...e,
        repliques: e.repliques.slice(0, -1),
        activite: null,
        erreur: message(erreur),
      }));
      return false;
    }
  };

  /** Pede o feedback; devolve null se falhar. */
  const terminer = async (): Promise<Feedback | null> => {
    const { sessionId } = etat;
    if (!sessionId) return null;
    setEtat((e) => ({ ...e, activite: "evaluation", erreur: null }));
    try {
      const feedback = await api.terminer(sessionId);
      setEtat((e) => ({ ...e, activite: null, terminee: true }));
      return feedback;
    } catch (erreur) {
      setEtat((e) => ({ ...e, activite: null, erreur: message(erreur) }));
      return null;
    }
  };

  return { etat, demarrer, envoyer, terminer };
}
