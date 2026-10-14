import {
  CreerSessionRequestSchema,
  EnvoyerMessageRequestSchema,
  type CreerSessionRequest,
  type EnvoyerMessageRequest,
  type Feedback,
  type TourCamille,
} from "@camille/shared";
import { Body, Controller, HttpCode, Inject, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { SessionsService } from "./sessions.service";

@Controller("sessions")
export class SessionsController {
  constructor(@Inject(SessionsService) private readonly sessions: SessionsService) {}

  /** Cria uma sessão e devolve a primeira fala da Camille. */
  @Post()
  creer(
    @Body(new ZodValidationPipe(CreerSessionRequestSchema)) body: CreerSessionRequest,
  ): Promise<TourCamille> {
    return this.sessions.creer(body);
  }

  /** Envia uma resposta do aluno e devolve a fala seguinte da Camille. */
  @Post(":id/messages")
  @HttpCode(200)
  envoyer(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(EnvoyerMessageRequestSchema)) body: EnvoyerMessageRequest,
  ): Promise<TourCamille> {
    return this.sessions.envoyer(id, body.texte);
  }

  /** Encerra a sessão e devolve o feedback na língua de apoio. */
  @Post(":id/terminer")
  @HttpCode(200)
  terminer(@Param("id", new ParseUUIDPipe()) id: string): Promise<Feedback> {
    return this.sessions.terminer(id);
  }
}
