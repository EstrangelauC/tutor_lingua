import { Module } from "@nestjs/common";
import { CamilleModule } from "../camille/camille.module";
import { TranscriptionModule } from "../transcription/transcription.module";
import { SessionsController } from "./sessions.controller";
import { SessionsService } from "./sessions.service";

@Module({
  imports: [CamilleModule, TranscriptionModule],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
