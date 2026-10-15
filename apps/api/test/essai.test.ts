import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CamilleSimulee } from "../src/camille/simulee.moteur";
import { EleveScripte } from "../src/essai/eleves";
import { jouerEssai, rapportEnMarkdown } from "../src/essai/session-essai";

describe("ensaio de uma sessão", () => {
  it("joga as trocas pedidas com a Camille simulada e produz o relatório", async () => {
    const contexte = { niveau: "B1", tache: "entretien", langueAppui: "pt-PT" } as const;
    const rapport = await jouerEssai({
      moteur: new CamilleSimulee(),
      eleve: new EleveScripte("entretien", "B1"),
      contexte,
      echanges: 3,
    });

    // Abertura + 3 × (aluno, Camille).
    assert.equal(rapport.transcription.length, 7);
    assert.equal(rapport.transcription[0]?.role, "camille");
    assert.match(rapport.transcription[1]?.texte ?? "", /Je m'appelle Nour/);
    assert.match(rapport.transcription.at(-1)?.texte ?? "", /terminée/);
    assert.equal(rapport.moteur, "simulação");
    assert.equal(rapport.eleve, "guião B1");
    assert.deepEqual(
      rapport.mesures.map((m) => m.etape),
      [
        "ouverture",
        "élève 1",
        "Camille 1",
        "élève 2",
        "Camille 2",
        "élève 3",
        "Camille 3",
        "bilan",
      ],
    );

    const markdown = rapportEnMarkdown(rapport);
    assert.match(markdown, /^# Ensaio — B1 · entretien · pt-PT/);
    assert.match(markdown, /## Conversa[\s\S]*\*\*Aluno\*\* — Bonjour\. Je m'appelle Nour/);
    assert.match(markdown, /Nível estimado: \*\*[AB][12]\*\* \(alvo B1\)/);
    assert.match(markdown, /\| \*\*Total\*\* \|/);
  });

  it("o guião recomeça quando a sessão tem mais trocas do que frases", async () => {
    const eleve = new EleveScripte("interaction", "A2");
    const premiere = await eleve.repondre();
    for (let i = 0; i < 7; i++) await eleve.repondre();
    assert.equal(await eleve.repondre(), premiere);
  });
});
