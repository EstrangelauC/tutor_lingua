import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { ErreurSchema, FeedbackSchema, type Feedback } from "@camille/shared";
import { Logger, ServiceUnavailableException } from "@nestjs/common";
import { z } from "zod";
import { erreurApi } from "../common/erreur-api";
import type { Conversation, MoteurCamille } from "./camille.types";
import {
  CONSIGNE_DERNIER_ECHANGE,
  OUVERTURE_ELEVE,
  REPLIQUE_DE_SECOURS,
  promptConversation,
  promptFeedback,
  transcriptionPourFeedback,
} from "./prompts";

// Se um classificador de segurança recusar o pedido, a API repete-o noutro modelo.
const BETAS: Anthropic.Beta.AnthropicBeta[] = ["server-side-fallback-2026-07-01"];

// O limite de 3 erros é aplicado depois, para não depender do suporte de maxItems nas saídas estruturadas.
const FeedbackModeleSchema = FeedbackSchema.extend({ erreurs: z.array(ErreurSchema) });

export class ClaudeCamille implements MoteurCamille {
  readonly nom = "claude";
  private readonly logger = new Logger(ClaudeCamille.name);

  constructor(
    private readonly client: Anthropic,
    private readonly model: string,
  ) {}

  ouvrir(conversation: Conversation): Promise<string> {
    return this.tour(conversation, [{ role: "user", content: OUVERTURE_ELEVE }]);
  }

  repondre(conversation: Conversation, texteEleve: string, derniere: boolean): Promise<string> {
    const nouveaux: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: texteEleve }];
    if (derniere) {
      nouveaux.push({ role: "system", content: CONSIGNE_DERNIER_ECHANGE });
    }
    return this.tour(conversation, nouveaux);
  }

  async evaluer(conversation: Conversation): Promise<Feedback> {
    const response = await this.appeler("bilan", () =>
      this.client.beta.messages.parse({
        model: this.model,
        max_tokens: 16000,
        betas: BETAS,
        fallbacks: "default",
        output_config: { effort: "high", format: betaZodOutputFormat(FeedbackModeleSchema) },
        system: promptFeedback(conversation.contexte),
        messages: [
          { role: "user", content: transcriptionPourFeedback(conversation.transcription) },
        ],
      }),
    );

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      this.logger.warn(`Feedback sem resultado (stop_reason=${response.stop_reason}).`);
      throw new ServiceUnavailableException(
        erreurApi("service_indisponible", "Não foi possível gerar o feedback."),
      );
    }
    const feedback = response.parsed_output;
    return { ...feedback, erreurs: feedback.erreurs.slice(0, 3) };
  }

  /** Envia o histórico mais as mensagens novas; só as junta à conversa se a chamada correr bem. */
  private async tour(
    conversation: Conversation,
    nouveaux: Anthropic.Beta.BetaMessageParam[],
  ): Promise<string> {
    const messages = [...conversation.messagesModele, ...nouveaux];
    const response = await this.appeler("fala", () =>
      this.client.beta.messages.create({
        model: this.model,
        max_tokens: 16000,
        betas: BETAS,
        fallbacks: "default",
        cache_control: { type: "ephemeral" },
        output_config: { effort: "low" },
        system: promptConversation(conversation.contexte),
        messages,
      }),
    );

    const texte =
      response.stop_reason === "refusal"
        ? ""
        : response.content
            .filter((bloc) => bloc.type === "text")
            .map((bloc) => bloc.text)
            .join(" ")
            .trim();

    if (texte === "") {
      this.logger.warn(`Resposta sem texto (stop_reason=${response.stop_reason}).`);
      conversation.messagesModele.push(...nouveaux, {
        role: "assistant",
        content: REPLIQUE_DE_SECOURS,
      });
      return REPLIQUE_DE_SECOURS;
    }

    // O conteúdo completo (incluindo blocos de raciocínio) volta tal e qual no pedido seguinte.
    conversation.messagesModele.push(...nouveaux, { role: "assistant", content: response.content });
    return texte;
  }

  /** Faz a chamada e regista a duração e os tokens (para acompanhar o custo nos logs). */
  private async appeler<T extends { usage?: Anthropic.Beta.BetaUsage }>(
    etape: string,
    requete: () => Promise<T>,
  ): Promise<T> {
    const debut = performance.now();
    try {
      const response = await requete();
      const u = response.usage;
      this.logger.log(
        `${etape}: ${Math.round(performance.now() - debut)} ms` +
          (u
            ? `, ${u.input_tokens} tokens de entrada (${u.cache_read_input_tokens ?? 0} em cache) + ${u.output_tokens} de saída`
            : ""),
      );
      return response;
    } catch (erreur) {
      if (
        erreur instanceof Anthropic.RateLimitError ||
        erreur instanceof Anthropic.InternalServerError ||
        erreur instanceof Anthropic.APIConnectionError
      ) {
        this.logger.warn(`API da Anthropic indisponível: ${erreur.message}`);
        throw new ServiceUnavailableException(
          erreurApi("service_indisponible", "A API da Anthropic está indisponível."),
        );
      }
      throw erreur;
    }
  }
}
