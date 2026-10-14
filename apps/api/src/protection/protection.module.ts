import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import type { Env } from "../config/env";
import { CleApiGuard } from "./cle-api.guard";
import { LimiteurGuard } from "./limiteur.guard";

/**
 * Dois limites por IP, em memória: um geral (pedidos por minuto) e um para criar sessões
 * (por hora), que é o que gasta créditos nos modelos. Os guards correm por esta ordem:
 * primeiro o limitador (barato, e conta também os pedidos sem chave), depois a chave.
 */
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        // Por omissão o throttler conta por rota; aqui conta-se por IP, somando todas as rotas.
        generateKey: (_context, ip, nom) => `${nom}:${ip}`,
        throttlers: [
          {
            name: "requetes",
            ttl: 60_000,
            limit: config.get("LIMITE_REQUETES_PAR_MINUTE", { infer: true }),
          },
          {
            name: "sessions",
            ttl: 60 * 60_000,
            limit: config.get("LIMITE_SESSIONS_PAR_HEURE", { infer: true }),
          },
        ],
      }),
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: LimiteurGuard },
    { provide: APP_GUARD, useClass: CleApiGuard },
  ],
})
export class ProtectionModule {}
