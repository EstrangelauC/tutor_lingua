import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PALETTES } from "../src/theme/palettes";

function luminance(hex: string): number {
  const rgb = [1, 3, 5].map((i) => {
    const value = parseInt(hex.slice(i, i + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
}
function contraste(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

describe("contraste des tokens Camille 2.0 (WCAG AA)", () => {
  for (const [theme, c] of Object.entries(PALETTES)) {
    it(`${theme}: texte courant, actions et états atteignent 4.5:1`, () => {
      const paires: Array<[string, string]> = [
        ...[c.fond, c.surface, c.discret].flatMap((fond) =>
          [c.encre, c.encre2, c.encre3].map((texte) => [texte, fond] as [string, string]),
        ),
        [c.surPrimaire, c.primaire],
        [c.surPlein, c.bleu],
        [c.surPlein, c.erreur],
        [c.bleuEncre, c.bleuDoux],
        [c.succes, c.succesDoux],
        [c.avertissement, c.avertissementDoux],
        [c.erreur, c.erreurDoux],
        [c.ecouteEncre, c.ecouteDoux],
        [c.surInactif, c.inactif],
        [c.navTexto, c.navFundo],
        [c.navMeta, c.navFundo],
        [c.navTexto, c.navAtivo],
      ];
      for (const [texte, fond] of paires) {
        assert.ok(
          contraste(texte, fond) >= 4.5,
          `${texte} / ${fond}: ${contraste(texte, fond).toFixed(2)}:1`,
        );
      }
    });
    it(`${theme}: limites des contrôles et focus atteignent 3:1`, () => {
      for (const fond of [c.fond, c.surface, c.discret]) {
        for (const trait of [c.controle, c.focus]) {
          assert.ok(
            contraste(trait, fond) >= 3,
            `${trait} / ${fond}: ${contraste(trait, fond).toFixed(2)}:1`,
          );
        }
      }
    });
  }
});
