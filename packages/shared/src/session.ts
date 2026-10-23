import { z } from "zod";
import { LangueAppuiSchema, NiveauSchema, TacheSchema } from "./base";

/** Número de respostas do aluno ao fim do qual a Camille encerra a sessão. */
export const MAX_ECHANGES = 8;

/** POST /sessions */
export const CreerSessionRequestSchema = z.object({
  niveau: NiveauSchema,
  tache: TacheSchema,
  langueAppui: LangueAppuiSchema,
});
export type CreerSessionRequest = z.infer<typeof CreerSessionRequestSchema>;

/** POST /sessions/:id/messages — o texto vem da transcrição da voz do aluno. */
export const EnvoyerMessageRequestSchema = z.object({
  texte: z.string().trim().min(1).max(2000),
});
export type EnvoyerMessageRequest = z.infer<typeof EnvoyerMessageRequestSchema>;

/** Resposta de POST /sessions e de POST /sessions/:id/messages. */
export const TourCamilleSchema = z.object({
  sessionId: z.uuid(),
  /** O que a Camille diz, sempre em francês. */
  camille: z.string(),
  /** Respostas do aluno já dadas nesta sessão. */
  echange: z.number().int().min(0),
  maxEchanges: z.number().int().positive(),
  /** true depois da última troca: já só falta pedir o feedback. */
  terminee: z.boolean(),
});
export type TourCamille = z.infer<typeof TourCamilleSchema>;

/**
 * Resposta de POST /sessions/:id/audio (multipart, campo "audio"):
 * a fala seguinte da Camille e o que se percebeu da gravação do aluno.
 */
export const TourAudioSchema = TourCamilleSchema.extend({
  texteEleve: z.string(),
});
export type TourAudio = z.infer<typeof TourAudioSchema>;

/** Uma fala da conversa, tal como a API a guarda. */
export const RepliqueSchema = z.object({
  role: z.enum(["camille", "eleve"]),
  texte: z.string(),
});
export type Replique = z.infer<typeof RepliqueSchema>;

/**
 * Resposta de GET /sessions/:id: o estado atual da sessão, para a app se ressincronizar quando
 * um pedido esgotou o tempo do lado dela mas a Camille acabou por responder. `camille` é a
 * última fala dela; `occupee` diz se ainda há um pedido a ser tratado.
 */
export const EtatSessionSchema = TourCamilleSchema.extend({
  transcription: z.array(RepliqueSchema),
  occupee: z.boolean(),
});
export type EtatSession = z.infer<typeof EtatSessionSchema>;

/** Nível estimado no feedback: pode ficar abaixo do nível alvo. */
export const NiveauEstimeSchema = z.enum(["A1", "A2", "B1", "B2"]);
export type NiveauEstime = z.infer<typeof NiveauEstimeSchema>;

export const ErreurSchema = z.object({
  /** Nome curto da regra, por exemplo « si + imparfait ». */
  titre: z.string(),
  /** Frase do aluno, em francês, tal como foi dita. */
  ditParLEleve: z.string(),
  /** Parte errada dentro de `ditParLEleve`, para destacar no ecrã. */
  extraitErrone: z.string(),
  /** A mesma frase corrigida, em francês. */
  formeCorrecte: z.string(),
  /** Parte corrigida dentro de `formeCorrecte`. */
  extraitCorrige: z.string(),
  /** Explicação curta na língua de apoio. */
  explication: z.string(),
});
export type Erreur = z.infer<typeof ErreurSchema>;

/** Resposta de POST /sessions/:id/terminer — textos na língua de apoio, francês só nos exemplos. */
export const FeedbackSchema = z.object({
  niveauEstime: NiveauEstimeSchema,
  /** Uma frase sobre o nível, por exemplo « Elementar — estás perto do B1 ». */
  resume: z.string(),
  erreurs: z.array(ErreurSchema).max(3),
  conseil: z.string(),
});
export type Feedback = z.infer<typeof FeedbackSchema>;
