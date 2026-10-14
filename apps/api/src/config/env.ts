import { z } from "zod";

// Uma linha "ANTHROPIC_API_KEY=" no .env chega como string vazia: trata-a como ausente.
const vazioComoAusente = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    ANTHROPIC_API_KEY: vazioComoAusente(z.string().trim().min(1).optional()),
    ANTHROPIC_MODEL: vazioComoAusente(z.string().trim().min(1).default("claude-opus-5-5")),
    OPENAI_API_KEY: vazioComoAusente(z.string().trim().min(1).optional()),
    OPENAI_TRANSCRIPTION_MODEL: vazioComoAusente(
      z.string().trim().min(1).default("gpt-4o-transcribe"),
    ),
    // A app envia-a em "Authorization: Bearer …". Sem chave, a API aceita qualquer pedido.
    CAMILLE_API_KEY: vazioComoAusente(z.string().trim().min(16).optional()),
    // Atrás de um proxy (Render, Fly, nginx…): usar o X-Forwarded-For para contar por IP.
    CONFIANCE_PROXY: vazioComoAusente(z.stringbool().default(false)),
    // Limites por IP: criar sessões é o que gasta créditos.
    LIMITE_SESSIONS_PAR_HEURE: vazioComoAusente(z.coerce.number().int().min(1).default(20)),
    LIMITE_REQUETES_PAR_MINUTE: vazioComoAusente(z.coerce.number().int().min(1).default(60)),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== "production") return;
    for (const chave of ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "CAMILLE_API_KEY"] as const) {
      if (env[chave] === undefined) {
        ctx.addIssue({
          code: "custom",
          path: [chave],
          message: "Obrigatória quando NODE_ENV=production.",
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

/** Usado pelo ConfigModule: falha o arranque com uma mensagem legível se o .env for inválido. */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Variáveis de ambiente inválidas:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
