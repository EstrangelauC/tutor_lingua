import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import { PALETTES } from "../theme/palettes";
import { STYLES_WEB } from "../theme/styles-web";
import { TITRE_DOCUMENT } from "../theme/mise-en-page";

/**
 * Molde do HTML da versão web (usado pelo `expo export`): título, cor do tema e fundo escuro
 * antes de a app carregar, para não haver um flash branco. O `lang` e o `dir` reais são
 * postos pela app ao arrancar, a partir da língua escolhida.
 */
export default function Racine({ children }: PropsWithChildren) {
  return (
    <html lang="pt-PT">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="color-scheme" content="light dark" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content={PALETTES.clair.fond}
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content={PALETTES.sombre.fond}
        />
        <meta
          name="description"
          content="Camille: prática oral do TCF IRN por voz, com feedback na tua língua."
        />
        <title>{TITRE_DOCUMENT}</title>
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: STYLES_WEB,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
