import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import type { Env } from "../config/env";
import { OpenAiTranscripteur } from "./openai.transcripteur";
import { TranscripteurSimule } from "./simule.transcripteur";
import { TRANSCRIPTEUR, type Transcripteur } from "./transcripteur";

@Module({
  providers: [
    {
      provide: TRANSCRIPTEUR,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): Transcripteur => {
        const logger = new Logger("Transcrição");
        const apiKey = config.get("OPENAI_API_KEY", { infer: true });
        if (apiKey === undefined) {
          logger.warn("Sem OPENAI_API_KEY: a usar a transcrição simulada.");
          return new TranscripteurSimule();
        }
        const modele = config.get("OPENAI_TRANSCRIPTION_MODEL", { infer: true });
        logger.log(`A usar o modelo ${modele}.`);
        return new OpenAiTranscripteur(new OpenAI({ apiKey }), modele);
      },
    },
  ],
  exports: [TRANSCRIPTEUR],
})
export class TranscriptionModule {}
