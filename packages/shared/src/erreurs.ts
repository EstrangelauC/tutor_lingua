import { z } from "zod";

/**
 * Códigos que a API põe no corpo dos erros (`{ code, message }`). A mensagem é para quem
 * desenvolve; a app traduz o código para a língua da interface.
 */
export const CodeErreurApiSchema = z.enum([
  "requete_invalide",
  "session_introuvable",
  "session_occupee",
  "session_terminee",
  "sans_reponse",
  "audio_trop_long",
  "audio_format",
  "audio_vide",
  "service_indisponible",
  "non_autorise",
  "trop_de_requetes",
]);
export type CodeErreurApi = z.infer<typeof CodeErreurApiSchema>;

/** Todos os códigos que um ErreurApi pode ter: os da API e os das falhas do lado do cliente. */
export type CodeErreur = CodeErreurApi | "reseau" | "delai" | "reponse_invalide" | "inconnu";

/** Para respostas sem código (por exemplo, erros gerados pelo próprio NestJS ou por um proxy). */
export function codeDepuisStatut(status: number): CodeErreur {
  if (status === 400) return "requete_invalide";
  if (status === 401 || status === 403) return "non_autorise";
  if (status === 404) return "session_introuvable";
  if (status === 409) return "session_occupee";
  if (status === 413) return "audio_trop_long";
  if (status === 415) return "audio_format";
  if (status === 422) return "audio_vide";
  if (status === 429) return "trop_de_requetes";
  if (status >= 500) return "service_indisponible";
  return "inconnu";
}
