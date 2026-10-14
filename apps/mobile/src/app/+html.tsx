import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import { TITRE_DOCUMENT } from "../theme/mise-en-page";

/**
 * Molde do HTML da versão web (usado pelo `expo export`): título, cor do tema e fundo escuro
 * antes de a app carregar, para não haver um flash branco. O `lang` e o `dir` reais são
 * postos pela app ao arrancar, a partir da língua escolhida.
 */
export default function Racine({ children }: PropsWithChildren) {
  return (
    <html lang="pt">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#F5F6FA" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0E1222" />
        <meta
          name="description"
          content="Camille: prática oral do TCF IRN por voz, com feedback na tua língua."
        />
        <title>{TITRE_DOCUMENT}</title>
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "body{background:#F5F6FA}@media (prefers-color-scheme:dark){body{background:#0E1222}}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
