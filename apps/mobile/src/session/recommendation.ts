import type { Tache, NiveauEstime } from "@camille/shared";
import { ECHELLE } from "../taches";

/**
 * Regra determinística para recomendar a próxima prática.
 */
export function recomendarPratica(historico: readonly { tache: string; feedback: { niveauEstime: string } }[], niveauCible: NiveauEstime): Tache {
  if (historico.length === 0) return "entretien";

  const niveauxAtuais: Record<Tache, number> = {
    entretien: -1,
    interaction: -1,
    point_de_vue: -1,
  };

  const tasks = ["entretien", "interaction", "point_de_vue"] as Tache[];
  tasks.forEach(t => {
    const sessoesTache = historico.filter(s => s.tache === t);
    if (sessoesTache.length > 0) {
      const ultimaSessao = sessoesTache[0];
      const nivel = ultimaSessao?.feedback.niveauEstime;
      niveauxAtuais[t] = ECHELLE.findIndex((niveau) => niveau === nivel);
    }
  });

  const nuncaPraticadas = tasks.filter(t => niveauxAtuais[t] === -1);
  if (nuncaPraticadas.length > 0) {
    return nuncaPraticadas[0] as Tache;
  }

  let tarefaRecomendada = "entretien" as Tache;
  let maiorLacuna = -Infinity;
  const alvo = ECHELLE.indexOf(niveauCible);

  tasks.forEach(t => {
    const nivel = niveauxAtuais[t];
    const lacuna = alvo - nivel;
    if (lacuna > maiorLacuna) {
      maiorLacuna = lacuna;
      tarefaRecomendada = t;
    }
  });

  return tarefaRecomendada;
}
