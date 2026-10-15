import { Logger, ServiceUnavailableException } from "@nestjs/common";
import OpenAI, { toFile } from "openai";
import { erreurApi } from "../common/erreur-api";
import type { AudioEleve, Transcripteur } from "./transcripteur";

// O feedback precisa dos erros do aluno: a transcrição não os pode corrigir.
const CONSIGNE =
  "Transcription mot à mot d'un apprenant de français langue étrangère. Garde les fautes de grammaire, les hésitations et les répétitions telles qu'elles sont dites, sans les corriger.";

export class OpenAiTranscripteur implements Transcripteur {
  readonly nom = "openai";
  private readonly logger = new Logger(OpenAiTranscripteur.name);

  constructor(
    private readonly client: OpenAI,
    private readonly modele: string,
  ) {}

  async transcrire({ contenu, typeMime, nomFichier }: AudioEleve): Promise<string> {
    const debut = performance.now();
    try {
      const resultat = await this.client.audio.transcriptions.create({
        file: await toFile(contenu, nomFichier, { type: typeMime }),
        model: this.modele,
        language: "fr",
        prompt: CONSIGNE,
      });
      const texte = resultat.text.trim();
      this.logger.log(
        `Transcrição: ${Math.round(performance.now() - debut)} ms, ${Math.round(contenu.length / 1024)} kB → ${texte.length} caracteres`,
      );
      return texte;
    } catch (erreur) {
      if (
        erreur instanceof OpenAI.RateLimitError ||
        erreur instanceof OpenAI.InternalServerError ||
        erreur instanceof OpenAI.APIConnectionError
      ) {
        this.logger.warn(`Transcrição indisponível: ${erreur.message}`);
        throw new ServiceUnavailableException(
          erreurApi("service_indisponible", "A transcrição da OpenAI está indisponível."),
        );
      }
      throw erreur;
    }
  }
}
