import { timingSafeEqual } from "node:crypto";
import {
  Inject,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { erreurApi } from "../common/erreur-api";
import type { Env } from "../config/env";

const PUBLIQUE = "publique";

/** Rotas abertas sem chave (só /health). */
export const Publique = () => SetMetadata(PUBLIQUE, true);

/**
 * Exige a CAMILLE_API_KEY em "Authorization: Bearer …". Sem chave configurada, deixa passar
 * tudo (desenvolvimento). A chave vai embutida na app, por isso trava quem só tem o URL,
 * não quem desmonta a app: os limites por IP são a segunda barreira.
 */
@Injectable()
export class CleApiGuard implements CanActivate {
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService<Env, true>,
    @Inject(Reflector) private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const attendue = this.config.get("CAMILLE_API_KEY", { infer: true });
    if (attendue === undefined) {
      return true;
    }
    const publique = this.reflector.getAllAndOverride<boolean | undefined>(PUBLIQUE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (publique) {
      return true;
    }
    const requete = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const entete = requete.headers.authorization;
    const recue =
      typeof entete === "string" && entete.startsWith("Bearer ") ? entete.slice(7).trim() : "";
    if (!memeCle(recue, attendue)) {
      throw new UnauthorizedException(
        erreurApi("non_autorise", "Chave de acesso em falta ou errada."),
      );
    }
    return true;
  }
}

/** Comparação em tempo constante: não revela quantos caracteres estão certos. */
function memeCle(recue: string, attendue: string): boolean {
  const a = Buffer.from(recue);
  const b = Buffer.from(attendue);
  return a.length === b.length && timingSafeEqual(a, b);
}
