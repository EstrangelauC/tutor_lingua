/**
 * Camille 2.0 Design System Tokens
 * Identidade visual académica, profissional e elegante.
 */

/** Escalas partilhadas: medidas em unidades lógicas (px na web, dp no nativo). */
export const ESPACES = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const RAYONS = {
  petit: 6,
  controle: 10,
  carte: 16,
  pilule: 999,
} as const;

export const BORDURES = {
  fine: 1,
  selection: 2,
  focus: 3,
} as const;

export const TOUCHE_MIN = 48;

export const LARGEURS = {
  lecture: 760,
  contenu: 1200,
} as const;

export const SEUILS = {
  mobileGrand: 400,
  tablette: 768,
  navigationLarge: 900,
  desktop: 1200,
} as const;
