import type { NiveauEstime, Tache } from "@camille/shared";

/** Nomes oficiais das tarefas da prova: ficam em francês em todas as línguas. */
export const TACHES: Record<Tache, { titre: string; numero: number }> = {
  entretien: { titre: "Entretien", numero: 1 },
  interaction: { titre: "Interaction", numero: 2 },
  point_de_vue: { titre: "Point de vue", numero: 3 },
};

/** Escala de níveis mostrada no feedback e no histórico, do mais baixo ao mais alto. */
export const ECHELLE: readonly NiveauEstime[] = ["A1", "A2", "B1", "B2"];
