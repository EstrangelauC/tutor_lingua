import type { Niveau, NiveauEstime } from "@camille/shared";
import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { useI18n } from "../i18n";
import { ECHELLE } from "../taches";
import { creerStyles, useTheme } from "../theme";
import { Text } from "./texte";

interface Props {
  /** Da sessão mais antiga para a mais recente. */
  niveaux: readonly NiveauEstime[];
  cible: Niveau;
  /** Mensagem no lugar da linha quando ainda não há sessões. */
  vide?: string;
}

const HAUTEUR = 148;
const MARGE = 14;

/** Evolução do nível estimado, com a linha do objetivo a tracejado. Em RTL, o tempo corre para a esquerda. */
export function GraphiqueNiveaux({ niveaux, cible, vide }: Props) {
  const styles = useStyles();
  const { couleurs } = useTheme();
  const { t, rtl } = useI18n();
  const [largeur, setLargeur] = useState(0);

  const y = (niveau: NiveauEstime) =>
    MARGE +
    ((ECHELLE.length - 1 - ECHELLE.indexOf(niveau)) * (HAUTEUR - 2 * MARGE)) / (ECHELLE.length - 1);
  const x = (i: number) => {
    const position =
      niveaux.length > 1 ? MARGE + (i * (largeur - 2 * MARGE)) / (niveaux.length - 1) : largeur / 2;
    return rtl ? largeur - position : position;
  };
  const derniere = niveaux.length - 1;

  return (
    <View
      accessible
      accessibilityLabel={vide ?? t.historique.graphique(niveaux.join(", "))}
      style={styles.graphique}
    >
      <View style={styles.axe}>
        {[...ECHELLE].reverse().map((niveau) => (
          <Text
            key={niveau}
            style={[styles.niveau, { top: y(niveau) - 9 }, niveau === cible && styles.niveauCible]}
          >
            {niveau}
          </Text>
        ))}
      </View>
      <View style={styles.trace} onLayout={(e) => setLargeur(e.nativeEvent.layout.width)}>
        {largeur > 0 && (
          <Svg width={largeur} height={HAUTEUR}>
            {ECHELLE.map((niveau) => (
              <Line
                key={niveau}
                x1={0}
                x2={largeur}
                y1={y(niveau)}
                y2={y(niveau)}
                stroke={niveau === cible ? couleurs.bleuTrait : couleurs.ligne}
                strokeWidth={niveau === cible ? 2 : 1}
                strokeDasharray={niveau === cible ? "6 5" : undefined}
              />
            ))}
            {niveaux.length > 1 && (
              <Polyline
                points={niveaux.map((niveau, i) => `${x(i)},${y(niveau)}`).join(" ")}
                fill="none"
                stroke={couleurs.bleu}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {niveaux.map((niveau, i) => (
              <Circle
                key={i}
                cx={x(i)}
                cy={y(niveau)}
                r={i === derniere ? 6 : 4}
                fill={i === derniere ? couleurs.bleu : couleurs.surface}
                stroke={couleurs.bleu}
                strokeWidth={2}
              />
            ))}
          </Svg>
        )}
        {vide && (
          <View style={styles.vide}>
            <Text style={styles.videTexte}>{vide}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const useStyles = creerStyles((c) => ({
  graphique: { flexDirection: "row", gap: 8 },
  axe: { width: 26, height: HAUTEUR },
  niveau: {
    position: "absolute",
    left: 0,
    right: 0,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: c.encre3,
    textAlign: "center",
  },
  niveauCible: { color: c.bleu, fontWeight: "700" },
  trace: { flex: 1, height: HAUTEUR },
  vide: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  videTexte: {
    fontSize: 14,
    lineHeight: 20,
    color: c.encre2,
    textAlign: "center",
    backgroundColor: c.surface,
    paddingHorizontal: 8,
  },
}));
