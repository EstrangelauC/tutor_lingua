import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { NiveauEstime } from "@camille/shared";
import {
  TAILLE_MAX_HISTORIQUE,
  ajouterEntree,
  derniereParTache,
  enMinutes,
  joursDepuis,
  lireHistorique,
  statistiques,
  type EntreeHistorique,
} from "../src/donnees/historique";

function entree(
  id: string,
  date: string,
  niveauEstime: NiveauEstime = "A2",
  tache: EntreeHistorique["tache"] = "entretien",
): EntreeHistorique {
  return {
    id,
    date,
    tache,
    niveau: "B1",
    langueAppui: "pt-PT",
    echanges: 8,
    dureeMs: 6 * 60_000,
    feedback: { niveauEstime, resume: "Bien.", erreurs: [], conseil: "Continue." },
  };
}

describe("histórico", () => {
  it("ignora entradas inválidas e põe a mais recente primeiro", () => {
    const lu = lireHistorique([
      entree("a", "2026-10-01T10:00:00.000Z"),
      { id: "estragada" },
      entree("b", "2026-10-03T10:00:00.000Z"),
    ]);
    assert.deepEqual(
      lu.map((e) => e.id),
      ["b", "a"],
    );
    assert.deepEqual(lireHistorique({ nao: "é uma lista" }), []);
  });

  it("pedir o feedback outra vez substitui a sessão em vez de a repetir", () => {
    const historique = [entree("a", "2026-10-01T10:00:00.000Z", "A1")];
    const apres = ajouterEntree(historique, entree("a", "2026-10-01T10:05:00.000Z", "A2"));
    assert.equal(apres.length, 1);
    assert.equal(apres[0]?.feedback.niveauEstime, "A2");
  });

  it(`guarda só as ${TAILLE_MAX_HISTORIQUE} sessões mais recentes`, () => {
    let historique: EntreeHistorique[] = [];
    for (let i = 0; i < TAILLE_MAX_HISTORIQUE + 5; i++) {
      historique = ajouterEntree(
        historique,
        entree(`s${i}`, new Date(2026, 0, 1, 0, i).toISOString()),
      );
    }
    assert.equal(historique.length, TAILLE_MAX_HISTORIQUE);
    assert.equal(historique[0]?.id, `s${TAILLE_MAX_HISTORIQUE + 4}`);
  });

  it("resume o progresso: sessões, minutos e evolução da mais antiga para a mais recente", () => {
    const historique = lireHistorique([
      entree("1", "2026-10-01T10:00:00.000Z", "A1"),
      entree("2", "2026-10-02T10:00:00.000Z", "A2"),
      entree("3", "2026-10-03T10:00:00.000Z", "B1"),
    ]);
    assert.deepEqual(statistiques(historique), {
      sessions: 3,
      minutes: 18,
      evolution: ["A1", "A2", "B1"],
    });
  });

  it("o gráfico mostra só as últimas 10 sessões", () => {
    const historique = lireHistorique(
      Array.from({ length: 12 }, (_, i) =>
        entree(`s${i}`, new Date(2026, 0, i + 1).toISOString(), i < 2 ? "A1" : "B2"),
      ),
    );
    const { evolution } = statistiques(historique);
    assert.equal(evolution.length, 10);
    assert.ok(evolution.every((niveau) => niveau === "B2"));
  });

  it("arredonda a duração ao minuto, com 1 minuto no mínimo", () => {
    assert.equal(enMinutes(10_000), 1);
    assert.equal(enMinutes(6.6 * 60_000), 7);
  });

  it("encontra a última sessão de cada tarefa", () => {
    const historique = lireHistorique([
      entree("1", "2026-10-01T10:00:00.000Z", "A1", "interaction"),
      entree("2", "2026-10-02T10:00:00.000Z", "A2", "interaction"),
      entree("3", "2026-10-03T10:00:00.000Z", "B1", "entretien"),
    ]);
    const parTache = derniereParTache(historique);
    assert.equal(parTache.interaction?.id, "2");
    assert.equal(parTache.entretien?.id, "3");
    assert.equal(parTache.point_de_vue, undefined);
  });

  it("conta dias de calendário: ontem à noite é «ontem» logo a seguir à meia-noite", () => {
    const maintenant = new Date(2026, 9, 14, 0, 30);
    assert.equal(joursDepuis(new Date(2026, 9, 14, 0, 5).toISOString(), maintenant), 0);
    assert.equal(joursDepuis(new Date(2026, 9, 13, 23, 50).toISOString(), maintenant), 1);
    assert.equal(joursDepuis(new Date(2026, 9, 11, 9, 0).toISOString(), maintenant), 3);
  });
});
