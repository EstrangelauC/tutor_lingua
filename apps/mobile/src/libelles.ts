import type { LangueAppui, Niveau, NiveauEstime, Tache } from "@camille/shared";

// Textos da interface em português por agora; o i18n chega num passo seguinte.

export const TACHES: Record<Tache, { titre: string; description: string; numero: number }> = {
  entretien: {
    titre: "Entretien",
    description: "Apresentar-te: quem és, a tua vida, os teus planos.",
    numero: 1,
  },
  interaction: {
    titre: "Interaction",
    description: "Pedir informações ou resolver uma situação do dia a dia.",
    numero: 2,
  },
  point_de_vue: {
    titre: "Point de vue",
    description: "Dar a tua opinião e defendê-la com exemplos.",
    numero: 3,
  },
};

export const NIVEAUX: Record<Niveau, string> = {
  A2: "Elementar",
  B1: "Intermédio",
  B2: "Intermédio superior",
};

/** Escala mostrada no feedback, do nível mais baixo ao mais alto. */
export const ECHELLE: readonly NiveauEstime[] = ["A1", "A2", "B1", "B2"];

/** Nome de cada língua na própria língua. */
export const LANGUES: Record<LangueAppui, string> = {
  "pt-PT": "Português",
  en: "English",
  es: "Español",
  ar: "العربية",
};
