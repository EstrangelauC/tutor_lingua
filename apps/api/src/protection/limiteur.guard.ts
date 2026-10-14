import { HttpException, HttpStatus, Injectable, type ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard, type ThrottlerLimitDetail } from "@nestjs/throttler";
import { erreurApi } from "../common/erreur-api";

/** O ThrottlerGuard com o corpo de erro da API ({ code, message }) em vez da mensagem genérica. */
@Injectable()
export class LimiteurGuard extends ThrottlerGuard {
  protected override async throwThrottlingException(
    _context: ExecutionContext,
    detail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new HttpException(
      erreurApi(
        "trop_de_requetes",
        `Mais de ${detail.limit} pedidos em ${Math.round(detail.ttl / 1000)} s a partir do mesmo IP.`,
      ),
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
