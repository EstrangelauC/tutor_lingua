import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./config/env";
import { HealthController } from "./health/health.controller";
import { ProtectionModule } from "./protection/protection.module";
import { SessionsModule } from "./sessions/sessions.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    ProtectionModule,
    SessionsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
