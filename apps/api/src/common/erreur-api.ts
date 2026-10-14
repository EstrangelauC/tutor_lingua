import type { CodeErreurApi } from "@camille/shared";

/**
 * Corpo dos erros da API: `code` é estável (a app traduz-o para a língua da interface);
 * `message` é em português, para quem desenvolve.
 */
export function erreurApi(
  code: CodeErreurApi,
  message: string,
): { code: CodeErreurApi; message: string } {
  return { code, message };
}
