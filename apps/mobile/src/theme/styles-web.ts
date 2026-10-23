import { PALETTES } from "./palettes";

/** Partagé par le document statique; aucune dépendance React Native côté CSS. */
export const STYLES_WEB = `
:root { --camille-focus: ${PALETTES.clair.focus}; }
body { background: ${PALETTES.clair.fond}; }
@media (prefers-color-scheme: dark) {
  :root { --camille-focus: ${PALETTES.sombre.focus}; }
  body { background: ${PALETTES.sombre.fond}; }
}
[role="button"]:focus-visible, button:focus-visible, [role="radio"]:focus-visible,
[role="checkbox"]:focus-visible, [role="tab"]:focus-visible,
a:focus-visible, input:focus-visible, textarea:focus-visible {
  outline: 3px solid var(--camille-focus) !important;
  outline-offset: 3px;
}
#camille-sidebar [role="button"]:focus-visible {
  outline-color: #FFFFFF !important;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  [role="button"]:active { transform: none !important; }
}
`;
