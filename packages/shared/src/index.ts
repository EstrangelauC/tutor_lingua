import { z } from "zod";

/** Nível alvo da prova oral do TCF IRN. */
export const NiveauSchema = z.enum(["A2", "B1", "B2"]);
export type Niveau = z.infer<typeof NiveauSchema>;

/** As três tarefas da prova oral. */
export const TacheSchema = z.enum(["entretien", "interaction", "point_de_vue"]);
export type Tache = z.infer<typeof TacheSchema>;

/** Língua em que a Camille dá o feedback no fim da sessão. */
export const LangueAppuiSchema = z.enum(["pt-PT", "en", "es", "ar"]);
export type LangueAppui = z.infer<typeof LangueAppuiSchema>;
