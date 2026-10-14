import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LangueAppuiSchema } from "@camille/shared";
import { TEXTES } from "../src/i18n/textes";
import { ar } from "../src/i18n/textes/ar";

/** Caminhos de todas as folhas («session.statuts.aToi») e o respetivo valor. */
function feuilles(objet: object, prefixe = ""): Array<[string, unknown]> {
  return Object.entries(objet).flatMap(([cle, valeur]) =>
    typeof valeur === "object" && valeur !== null
      ? feuilles(valeur as object, `${prefixe}${cle}.`)
      : [[`${prefixe}${cle}`, valeur] as [string, unknown]],
  );
}

describe("dicionários", () => {
  const reference = feuilles(TEXTES["pt-PT"]).map(([chemin]) => chemin);

  for (const langue of LangueAppuiSchema.options) {
    it(`${langue}: tem os mesmos textos que o português e nenhum vazio`, () => {
      const textes = feuilles(TEXTES[langue]);
      assert.deepEqual(
        textes.map(([chemin]) => chemin),
        reference,
      );
      for (const [chemin, valeur] of textes) {
        const texte =
          typeof valeur === "function" ? (valeur as (...a: unknown[]) => unknown)(3, "B1") : valeur;
        assert.equal(typeof texte, "string", chemin);
        assert.notEqual((texte as string).trim(), "", chemin);
      }
    });
  }

  it("árabe: usa o dual e o plural certos", () => {
    assert.equal(ar.quand(2), "قبل يومين");
    assert.equal(ar.quand(5), "قبل 5 أيام");
    assert.equal(ar.quand(12), "قبل 12 يومًا");
    assert.equal(ar.historique.ligne(1, 8), "دقيقة واحدة · 8 تبادلات");
    assert.equal(ar.definitions.effacerQuestion(2), "حذف جلستين من السجل؟");
  });
});
