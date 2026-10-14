import type { z } from "zod";
import { CodeErreurApiSchema, codeDepuisStatut, type CodeErreur } from "./erreurs";
import {
  FeedbackSchema,
  TourAudioSchema,
  TourCamilleSchema,
  type CreerSessionRequest,
  type Feedback,
  type TourAudio,
  type TourCamille,
} from "./session";

/** Erro devolvido pela API (status > 0) ou falha de rede/tempo esgotado (status 0). */
export class ErreurApi extends Error {
  constructor(
    readonly status: number,
    /** Estável, para a app escolher a mensagem na língua da interface. */
    readonly code: CodeErreur,
    message: string,
  ) {
    super(message);
    this.name = "ErreurApi";
  }

  /** Vale a pena tentar outra vez: falha de rede, API sobrecarregada ou a Camille ainda ocupada. */
  get temporaire(): boolean {
    return this.status === 0 || this.status === 409 || this.status >= 500;
  }
}

export interface OptionsClient {
  /** Endereço da API, por exemplo http://192.168.1.10:3000 */
  baseUrl: string;
  /** Chave de acesso à API (CAMILLE_API_KEY), enviada em Authorization: Bearer. */
  cleApi?: string;
  /** Para testes; por omissão usa o fetch global. */
  fetch?: typeof fetch;
}

// O feedback é mais lento a gerar do que uma fala da Camille.
const DELAI_TOUR_MS = 45_000;
const DELAI_FEEDBACK_MS = 120_000;
// Transcrição + fala da Camille.
const DELAI_AUDIO_MS = 60_000;

export interface ClientCamille {
  creerSession(demande: CreerSessionRequest): Promise<TourCamille>;
  envoyerMessage(sessionId: string, texte: string): Promise<TourCamille>;
  /** `audio` é um FormData com a gravação no campo "audio" (a forma de o criar depende da plataforma). */
  envoyerAudio(sessionId: string, audio: FormData): Promise<TourAudio>;
  terminer(sessionId: string): Promise<Feedback>;
}

export function creerClientCamille({
  baseUrl,
  cleApi,
  fetch: fetchFn = fetch,
}: OptionsClient): ClientCamille {
  const racine = baseUrl.replace(/\/+$/, "");
  const autorisation: Record<string, string> = cleApi ? { authorization: `Bearer ${cleApi}` } : {};

  async function post<S extends z.ZodType>(
    chemin: string,
    schema: S,
    delaiMs: number,
    corps?: unknown,
  ): Promise<z.output<S>> {
    const controleur = new AbortController();
    const minuterie = setTimeout(() => controleur.abort(), delaiMs);
    let response: Response;
    try {
      // Com FormData, o fetch define o content-type multipart (com o boundary) sozinho.
      const multipart = typeof FormData !== "undefined" && corps instanceof FormData;
      response = await fetchFn(`${racine}${chemin}`, {
        method: "POST",
        headers: multipart
          ? { accept: "application/json", ...autorisation }
          : { "content-type": "application/json", accept: "application/json", ...autorisation },
        body: multipart ? corps : corps === undefined ? undefined : JSON.stringify(corps),
        signal: controleur.signal,
      });
    } catch {
      throw controleur.signal.aborted
        ? new ErreurApi(0, "delai", "A API demorou demasiado a responder.")
        : new ErreurApi(0, "reseau", "Sem ligação à API.");
    } finally {
      clearTimeout(minuterie);
    }

    const json: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      throw new ErreurApi(
        response.status,
        codeErreur(json) ?? codeDepuisStatut(response.status),
        messageErreur(json) ?? `Erro ${response.status}.`,
      );
    }
    const resultat = schema.safeParse(json);
    if (!resultat.success) {
      throw new ErreurApi(response.status, "reponse_invalide", "Resposta inesperada da API.");
    }
    return resultat.data;
  }

  return {
    creerSession: (demande) => post("/sessions", TourCamilleSchema, DELAI_TOUR_MS, demande),
    envoyerMessage: (sessionId, texte) =>
      post(
        `/sessions/${encodeURIComponent(sessionId)}/messages`,
        TourCamilleSchema,
        DELAI_TOUR_MS,
        {
          texte,
        },
      ),
    envoyerAudio: (sessionId, audio) =>
      post(
        `/sessions/${encodeURIComponent(sessionId)}/audio`,
        TourAudioSchema,
        DELAI_AUDIO_MS,
        audio,
      ),
    terminer: (sessionId) =>
      post(
        `/sessions/${encodeURIComponent(sessionId)}/terminer`,
        FeedbackSchema,
        DELAI_FEEDBACK_MS,
      ),
  };
}

function codeErreur(json: unknown): CodeErreur | undefined {
  if (typeof json === "object" && json !== null && "code" in json) {
    const resultat = CodeErreurApiSchema.safeParse((json as { code: unknown }).code);
    if (resultat.success) return resultat.data;
  }
  return undefined;
}

function messageErreur(json: unknown): string | undefined {
  if (typeof json === "object" && json !== null && "message" in json) {
    const { message } = json as { message: unknown };
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string") return message[0];
  }
  return undefined;
}
