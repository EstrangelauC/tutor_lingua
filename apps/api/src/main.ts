import "reflect-metadata";
import { NiveauSchema, type Niveau } from "@camille/shared";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import type { Env } from "./config/env";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  const port = config.get("PORT", { infer: true });

  await app.listen(port);

  const niveaux: readonly Niveau[] = NiveauSchema.options;
  Logger.log(
    `API a escutar em http://localhost:${port} (níveis: ${niveaux.join(", ")})`,
    "Bootstrap",
  );
}

void bootstrap();
