import Anthropic from "@anthropic-ai/sdk";
import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../config/env";
import { MOTEUR_CAMILLE, type MoteurCamille } from "./camille.types";
import { ClaudeCamille } from "./claude.moteur";
import { CamilleSimulee } from "./simulee.moteur";

@Module({
  providers: [
    {
      provide: MOTEUR_CAMILLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): MoteurCamille => {
        const logger = new Logger("Camille");
        const apiKey = config.get("ANTHROPIC_API_KEY", { infer: true });
        if (apiKey === undefined) {
          logger.warn("Sem ANTHROPIC_API_KEY: a usar a Camille simulada.");
          return new CamilleSimulee();
        }
        const model = config.get("ANTHROPIC_MODEL", { infer: true });
        logger.log(`A usar o modelo ${model}.`);
        return new ClaudeCamille(new Anthropic({ apiKey }), model);
      },
    },
  ],
  exports: [MOTEUR_CAMILLE],
})
export class CamilleModule {}
