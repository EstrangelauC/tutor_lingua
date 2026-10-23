import test from "node:test";
import assert from "node:assert";
import { recomendarPratica } from "../src/session/recommendation";

test("deve recomendar 'entretien' quando não houver histórico", () => {
  assert.strictEqual(recomendarPratica([], "B1"), "entretien");
});

test("deve recomendar a tarefa nunca praticada seguindo a prioridade", () => {
  const historico = [
    { tache: "interaction", feedback: { niveauEstime: "A2" } },
  ];
  assert.strictEqual(recomendarPratica(historico, "B1"), "entretien");
});

test("deve recomendar a tarefa com o nível estimado mais baixo", () => {
  const historico = [
    { tache: "entretien", feedback: { niveauEstime: "B1" } },
    { tache: "interaction", feedback: { niveauEstime: "A2" } },
    { tache: "point_de_vue", feedback: { niveauEstime: "B1" } },
  ];
  assert.strictEqual(recomendarPratica(historico, "B2"), "interaction");
});

test("deve resolver empates seguindo a prioridade (entretien > interaction > point_de_vue)", () => {
  const historico = [
    { tache: "entretien", feedback: { niveauEstime: "A2" } },
    { tache: "interaction", feedback: { niveauEstime: "A2" } },
    { tache: "point_de_vue", feedback: { niveauEstime: "A2" } },
  ];
  assert.strictEqual(recomendarPratica(historico, "B2"), "entretien");
});

test("deve recomendar a tarefa mais baixa mesmo que todas estejam acima do alvo", () => {
  const historico = [
    { tache: "entretien", feedback: { niveauEstime: "B2" } },
    { tache: "interaction", feedback: { niveauEstime: "B1" } },
    { tache: "point_de_vue", feedback: { niveauEstime: "B2" } },
  ];
  assert.strictEqual(recomendarPratica(historico, "A2"), "interaction");
});
