import type { z } from "zod";
import {
  FeedbackSchema,
  TourCamilleSchema,
  type CreerSessionRequest,
  type Feedback,
  type TourCamille,
} from "./session";

/** Erro devolvido pela API (status > 0) ou falha de rede/tempo esgotado (status 0). */
export class ErreurApi extends Error {
  constructor(
    readonly status: number,
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
  /** Para testes; por omissão usa o fetch global. */
  fetch?: typeof fetch;
}

// O feedback é mais lento a gerar do que uma fala da Camille.
const DELAI_TOUR_MS = 45_000;
const DELAI_FEEDBACK_MS = 120_000;

export interface ClientCamille {
  creerSession(demande: CreerSessionRequest): Promise<TourCamille>;
  envoyerMessage(sessionId: string, texte: string): Promise<TourCamille>;
  terminer(sessionId: string): Promise<Feedback>;
}

export function creerClientCamille({
  baseUrl,
  fetch: fetchFn = fetch,
}: OptionsClient): ClientCamille {
  const racine = baseUrl.replace(/\/+$/, "");

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
      response = await fetchFn(`${racine}${chemin}`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: corps === undefined ? undefined : JSON.stringify(corps),
        signal: controleur.signal,
      });
    } catch {
      throw new ErreurApi(
        0,
        controleur.signal.aborted ? "A API demorou demasiado a responder." : "Sem ligação à API.",
      );
    } finally {
      clearTimeout(minuterie);
    }

    const json: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      throw new ErreurApi(response.status, messageErreur(json) ?? `Erro ${response.status}.`);
    }
    const resultat = schema.safeParse(json);
    if (!resultat.success) {
      throw new ErreurApi(response.status, "Resposta inesperada da API.");
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
    terminer: (sessionId) =>
      post(
        `/sessions/${encodeURIComponent(sessionId)}/terminer`,
        FeedbackSchema,
        DELAI_FEEDBACK_MS,
      ),
  };
}

function messageErreur(json: unknown): string | undefined {
  if (typeof json === "object" && json !== null && "message" in json) {
    const { message } = json as { message: unknown };
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string") return message[0];
  }
  return undefined;
}
