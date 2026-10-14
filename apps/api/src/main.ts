import "reflect-metadata";
import { NiveauSchema, type Niveau } from "@camille/shared";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import type { Env } from "./config/env";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  const port = config.get("PORT", { infer: true });

  // Atrás de um proxy, o IP do cliente vem no X-Forwarded-For: os limites por IP precisam dele.
  if (config.get("CONFIANCE_PROXY", { infer: true })) {
    app.set("trust proxy", 1);
  }

  // A app nativa não precisa de CORS. A versão web precisa: em desenvolvimento aceita-se
  // qualquer origem (o Expo em localhost:8081); em produção, só as de CORS_ORIGINES.
  const origines = config.get("CORS_ORIGINES", { infer: true });
  if (origines) {
    app.enableCors({ origin: origines.split(",").map((o) => o.trim()) });
  } else if (config.get("NODE_ENV", { infer: true }) === "development") {
    app.enableCors();
  }

  await app.listen(port);

  const niveaux: readonly Niveau[] = NiveauSchema.options;
  Logger.log(
    `API a escutar em http://localhost:${port} (níveis: ${niveaux.join(", ")})`,
    "Bootstrap",
  );
  Logger.log(
    config.get("CAMILLE_API_KEY", { infer: true })
      ? "Chave de acesso ativa (CAMILLE_API_KEY)."
      : "Sem CAMILLE_API_KEY: a API aceita qualquer pedido. Só em desenvolvimento.",
    "Bootstrap",
  );
  Logger.log(
    `Limites por IP: ${config.get("LIMITE_REQUETES_PAR_MINUTE", { infer: true })} pedidos/min, ${config.get("LIMITE_SESSIONS_PAR_HEURE", { infer: true })} sessões/h.`,
    "Bootstrap",
  );
}

void bootstrap();
