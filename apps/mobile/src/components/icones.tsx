import type { ReactNode } from "react";
import type { ColorValue } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

interface Props {
  couleur: ColorValue;
  taille?: number;
  /** Espelha o ícone (setas em RTL). */
  miroir?: boolean;
}

function Icone({
  couleur,
  taille = 24,
  miroir = false,
  children,
}: Props & { children: ReactNode }) {
  return (
    <Svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke={couleur}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={miroir ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      {children}
    </Svg>
  );
}

export function IconeAccueil(props: Props) {
  return (
    <Icone {...props}>
      <Path d="M3 11 12 4l9 7" />
      <Path d="M5.5 9.5V20h4.5v-5.5h4V20h4.5V9.5" />
    </Icone>
  );
}

export function IconeHistorique(props: Props) {
  return (
    <Icone {...props}>
      <Path d="M4 20h16" />
      <Path d="M7 16v-4" />
      <Path d="M12 16V7" />
      <Path d="M17 16v-6" />
    </Icone>
  );
}

export function IconeReglages(props: Props) {
  return (
    <Icone {...props}>
      <Path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <Circle cx={15} cy={7} r={2} />
      <Circle cx={9} cy={17} r={2} />
    </Icone>
  );
}

/** Seta para trás (aponta para a direita em RTL com `miroir`). */
export function IconeRetour(props: Props) {
  return (
    <Icone {...props}>
      <Path d="m15 5-7 7 7 7" />
    </Icone>
  );
}

/** Seta para a frente, nas linhas que abrem outro ecrã. */
export function IconeSuivant(props: Props) {
  return (
    <Icone {...props}>
      <Path d="m9 5 7 7-7 7" />
    </Icone>
  );
}

export function IconeHautParleur(props: Props) {
  return (
    <Icone {...props}>
      <Path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
      <Path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </Icone>
  );
}
