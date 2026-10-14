import { Module } from "@nestjs/common";
import { CamilleModule } from "../camille/camille.module";
import { SessionsController } from "./sessions.controller";
import { SessionsService } from "./sessions.service";

@Module({
  imports: [CamilleModule],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
