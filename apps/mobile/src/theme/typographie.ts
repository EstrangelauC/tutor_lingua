import type { TextStyle } from "react-native";
import { serif } from "./couleurs";

/**
 * Camille 2.0 Typographie
 * Hierarquia clara para legibilidade máxima em contextos educativos.
 */
export const TYPOGRAPHIE = {
  // Títulos de Páginas: Impacto e clareza
  page: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  // Títulos de Secções: Organização estrutural
  section: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  // Texto Principal: Conforto de leitura (Body)
  corps: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: "400",
  },
  // Descrições: Texto secundário, menos peso visual
  description: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400",
  },
  // Rótulos: Identificação de campos e botões
  libelle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    textTransform: "none", // Evita uppercase forçado para manter a elegância
  },
  // Metadados: Informação técnica, data, status
  meta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },
  // Resultados e Níveis: Ênfase em progresso e conquista
  resultat: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: "800",
    letterSpacing: -1,
  },
  // Conteúdo em Francês: Elegância académica com serifa
  francais: {
    fontFamily: serif,
    fontSize: 19,
    lineHeight: 30,
    writingDirection: "ltr",
    textAlign: "left",
    fontStyle: "normal",
  },
} satisfies Record<string, TextStyle>;

export type VarianteTexte = keyof typeof TYPOGRAPHIE;
