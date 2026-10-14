import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { Publique } from "../protection/cle-api.guard";

/** Verificação de vida, sem chave nem limites: é o que os monitores e o `curl` de arranque chamam. */
@Controller("health")
@Publique()
@SkipThrottle({ requetes: true, sessions: true })
export class HealthController {
  @Get()
  verifier(): { status: "ok" } {
    return { status: "ok" };
  }
}
