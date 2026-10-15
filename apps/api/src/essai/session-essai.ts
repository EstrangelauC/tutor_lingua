import { MAX_ECHANGES, type Feedback } from "@camille/shared";
import type {
  ContexteSession,
  Conversation,
  MoteurCamille,
  Replique,
} from "../camille/camille.types";

/** Quem responde à Camille durante um ensaio (guião fixo ou modelo a fazer de aluno). */
export interface Eleve {
  readonly nom: string;
  repondre(derniereCamille: string, transcription: readonly Replique[]): Promise<string>;
}

export interface Mesure {
  etape: string;
  ms: number;
}

export interface Rapport {
  contexte: ContexteSession;
  moteur: string;
  eleve: string;
  date: string;
  transcription: Replique[];
  feedback: Feedback;
  mesures: Mesure[];
}

interface OptionsEssai {
  moteur: MoteurCamille;
  eleve: Eleve;
  contexte: ContexteSession;
  echanges?: number;
}

/** Joga uma sessão inteira, como a SessionsService faria, e devolve tudo o que foi dito e medido. */
export async function jouerEssai({
  moteur,
  eleve,
  contexte,
  echanges = MAX_ECHANGES,
}: OptionsEssai): Promise<Rapport> {
  const conversation: Conversation = { contexte, transcription: [], messagesModele: [] };
  const mesures: Mesure[] = [];
  const chrono = async <T>(etape: string, action: () => Promise<T>): Promise<T> => {
    const debut = performance.now();
    const resultat = await action();
    mesures.push({ etape, ms: Math.round(performance.now() - debut) });
    return resultat;
  };

  let camille = await chrono("ouverture", () => moteur.ouvrir(conversation));
  conversation.transcription.push({ role: "camille", texte: camille });
  for (let i = 1; i <= echanges; i++) {
    const texte = await chrono(`élève ${i}`, () =>
      eleve.repondre(camille, conversation.transcription),
    );
    camille = await chrono(`Camille ${i}`, () =>
      moteur.repondre(conversation, texte, i === echanges),
    );
    conversation.transcription.push({ role: "eleve", texte }, { role: "camille", texte: camille });
  }
  const feedback = await chrono("bilan", () => moteur.evaluer(conversation));

  return {
    contexte,
    moteur: moteur.nom,
    eleve: eleve.nom,
    date: new Date().toISOString(),
    transcription: conversation.transcription,
    feedback,
    mesures,
  };
}

export function rapportEnMarkdown(r: Rapport): string {
  const { niveau, tache, langueAppui } = r.contexte;
  const total = r.mesures.reduce((somme, m) => somme + m.ms, 0);
  const lignes = [
    `# Ensaio — ${niveau} · ${tache} · ${langueAppui}`,
    "",
    `Motor: ${r.moteur} · Aluno: ${r.eleve} · ${r.date}`,
    "",
    "## Conversa",
    "",
    ...r.transcription.map(({ role, texte }) =>
      role === "camille" ? `**Camille** — ${texte}\n` : `**Aluno** — ${texte}\n`,
    ),
    "## Bilan",
    "",
    `Nível estimado: **${r.feedback.niveauEstime}** (alvo ${niveau})`,
    "",
    r.feedback.resume,
    "",
    r.feedback.erreurs.length === 0 ? "_Sem erros assinalados._" : "### Erros",
    "",
    ...r.feedback.erreurs.map(
      (e, i) =>
        `${i + 1}. **${e.titre}** — « ${e.ditParLEleve} » [${e.extraitErrone}] → « ${e.formeCorrecte} » [${e.extraitCorrige}]\n   ${e.explication}\n`,
    ),
    "### Conselho",
    "",
    r.feedback.conseil,
    "",
    "## Medidas",
    "",
    "| Etapa | ms |",
    "| --- | ---: |",
    ...r.mesures.map((m) => `| ${m.etape} | ${m.ms} |`),
    `| **Total** | **${total}** |`,
    "",
  ];
  return lignes.join("\n");
}
