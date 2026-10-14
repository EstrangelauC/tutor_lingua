import {
  CreerSessionRequestSchema,
  EnvoyerMessageRequestSchema,
  type CreerSessionRequest,
  type EnvoyerMessageRequest,
  type Feedback,
  type TourAudio,
  type TourCamille,
} from "@camille/shared";
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SkipThrottle } from "@nestjs/throttler";
import { erreurApi } from "../common/erreur-api";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { SessionsService } from "./sessions.service";

/** O que o FileInterceptor (multer, em memória) põe em @UploadedFile(). */
interface FichierRecu {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

/** Uma resposta oral de ~1 min em AAC ocupa ~1 MB; 10 MB dá margem. */
const TAILLE_MAX_AUDIO = 10 * 1024 * 1024;

/** Formatos aceites pela transcrição, com a extensão que o fornecedor usa para os reconhecer. */
const EXTENSIONS: Record<string, string> = {
  "audio/mp4": "m4a",
  "audio/m4a": "m4a",
  "audio/x-m4a": "m4a",
  "video/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/webm": "webm",
  "video/webm": "webm",
  "audio/ogg": "ogg",
};

// O limite de sessões por hora só conta a criação; as outras rotas contam só para o limite geral.
@Controller("sessions")
@SkipThrottle({ sessions: true })
export class SessionsController {
  constructor(@Inject(SessionsService) private readonly sessions: SessionsService) {}

  /** Cria uma sessão e devolve a primeira fala da Camille. */
  @Post()
  @SkipThrottle({ sessions: false })
  creer(
    @Body(new ZodValidationPipe(CreerSessionRequestSchema)) body: CreerSessionRequest,
  ): Promise<TourCamille> {
    return this.sessions.creer(body);
  }

  /** Envia uma resposta escrita do aluno e devolve a fala seguinte da Camille. */
  @Post(":id/messages")
  @HttpCode(200)
  envoyer(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(EnvoyerMessageRequestSchema)) body: EnvoyerMessageRequest,
  ): Promise<TourCamille> {
    return this.sessions.envoyer(id, body.texte);
  }

  /** Envia uma resposta gravada (multipart, campo "audio"): transcreve-a e devolve a fala seguinte. */
  @Post(":id/audio")
  @HttpCode(200)
  @UseInterceptors(FileInterceptor("audio", { limits: { fileSize: TAILLE_MAX_AUDIO } }))
  envoyerAudio(
    @Param("id", new ParseUUIDPipe()) id: string,
    @UploadedFile() fichier: FichierRecu | undefined,
  ): Promise<TourAudio> {
    if (!fichier || fichier.buffer.length === 0) {
      throw new BadRequestException(
        erreurApi("requete_invalide", 'Falta a gravação no campo "audio".'),
      );
    }
    const typeMime = fichier.mimetype.split(";")[0]?.trim().toLowerCase() ?? "";
    const extension = EXTENSIONS[typeMime];
    if (!extension) {
      throw new UnsupportedMediaTypeException(
        erreurApi("audio_format", `Formato de áudio não suportado: ${typeMime}.`),
      );
    }
    return this.sessions.envoyerAudio(id, {
      contenu: fichier.buffer,
      typeMime,
      nomFichier: `resposta.${extension}`,
    });
  }

  /** Encerra a sessão e devolve o feedback na língua de apoio. */
  @Post(":id/terminer")
  @HttpCode(200)
  terminer(@Param("id", new ParseUUIDPipe()) id: string): Promise<Feedback> {
    return this.sessions.terminer(id);
  }
}
