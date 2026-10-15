import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  lirePreferences,
  modifierPreferences,
  preferencesParDefaut,
} from "../src/donnees/preferences";
import { estRtl, langueDepuisAppareil } from "../src/i18n/langues";

describe("língua do aparelho", () => {
  it("escolhe a primeira língua suportada, por ordem de preferência", () => {
    assert.equal(langueDepuisAppareil(["pt-BR"]), "pt-PT");
    assert.equal(langueDepuisAppareil(["fr-FR", "ar-MA", "en-GB"]), "ar");
    assert.equal(langueDepuisAppareil([null, "es_ES"]), "es");
    assert.equal(langueDepuisAppareil(["uk-UA"]), "uk");
    assert.equal(langueDepuisAppareil(["tr"]), "tr");
    assert.equal(langueDepuisAppareil(["ro-RO"]), "ro");
  });

  it("usa inglês quando nenhuma é suportada", () => {
    assert.equal(langueDepuisAppareil(["de-DE", "it-IT"]), "en");
    assert.equal(langueDepuisAppareil([]), "en");
  });

  it("só o árabe se escreve da direita para a esquerda", () => {
    assert.equal(estRtl("ar"), true);
    assert.equal(estRtl("pt-PT"), false);
  });
});

describe("preferências", () => {
  const defaut = preferencesParDefaut("es");

  it("começam na língua do aparelho, para a interface e para o feedback", () => {
    assert.equal(defaut.langueInterface, "es");
    assert.equal(defaut.langueAppui, "es");
    assert.equal(defaut.niveau, "B1");
    assert.equal(defaut.onboardingFait, false);
  });

  it("quem já usava a app antes da introdução não a vê", () => {
    const anciennes = { langueInterface: "pt-PT", langueAppui: "pt-PT", niveau: "B2" };
    const lues = lirePreferences(anciennes, preferencesParDefaut("en", true));
    assert.equal(lues.onboardingFait, true);
    assert.equal(lues.niveau, "B2");
    assert.equal(
      lirePreferences(undefined, preferencesParDefaut("en", false)).onboardingFait,
      false,
    );
  });

  it("sem nada guardado, ficam as de omissão", () => {
    assert.deepEqual(lirePreferences(undefined, defaut), defaut);
    assert.deepEqual(lirePreferences("lixo", defaut), defaut);
  });

  it("um campo inválido volta ao valor de omissão sem perder os outros", () => {
    const lues = lirePreferences(
      { langueInterface: "ar", niveau: "C2", theme: "sombre", inconnu: true },
      defaut,
    );
    assert.deepEqual(lues, { ...defaut, langueInterface: "ar", theme: "sombre" });
  });

  it("o feedback acompanha a interface quando estavam na mesma língua", () => {
    const suivantes = modifierPreferences(defaut, { langueInterface: "ar" });
    assert.equal(suivantes.langueInterface, "ar");
    assert.equal(suivantes.langueAppui, "ar");
  });

  it("o feedback não muda se o aluno o tinha escolhido noutra língua", () => {
    const choisies = modifierPreferences(defaut, { langueAppui: "pt-PT" });
    const suivantes = modifierPreferences(choisies, { langueInterface: "en" });
    assert.equal(suivantes.langueInterface, "en");
    assert.equal(suivantes.langueAppui, "pt-PT");
  });
});
