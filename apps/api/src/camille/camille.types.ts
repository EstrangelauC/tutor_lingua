import type Anthropic from "@anthropic-ai/sdk";
import type { CreerSessionRequest, Feedback, Replique } from "@camille/shared";

export type ContexteSession = CreerSessionRequest;
export type { Replique };

/** Estado de uma conversa. A sessão guarda-o; o motor só lhe acrescenta mensagens depois de uma chamada bem-sucedida. */
export interface Conversation {
  contexte: ContexteSession;
  /** Transcrição legível, usada para gerar o feedback. */
  transcription: Replique[];
  /** Histórico no formato da API da Anthropic. Só se acrescenta, nunca se edita. */
  messagesModele: Anthropic.Beta.BetaMessageParam[];
}

export interface MoteurCamille {
  readonly nom: string;
  /** Primeira fala da Camille. */
  ouvrir(conversation: Conversation): Promise<string>;
  /** Fala da Camille depois de uma resposta do aluno. `derniere` marca a última troca. */
  repondre(conversation: Conversation, texteEleve: string, derniere: boolean): Promise<string>;
  /** Feedback final, na língua de apoio. */
  evaluer(conversation: Conversation): Promise<Feedback>;
}

export const MOTEUR_CAMILLE = Symbol("MOTEUR_CAMILLE");
