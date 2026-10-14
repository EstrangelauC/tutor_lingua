import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { TOUCHE_MIN, creerStyles } from "../theme";
import { Text } from "./texte";

export interface OptionChoix<V extends string> {
  valeur: V;
  libelle: string;
  accessibilityLabel?: string;
}

interface Props<V extends string> {
  options: readonly OptionChoix<V>[];
  valeur: V;
  onChange: (valeur: V) => void;
  style?: StyleProp<ViewStyle>;
}

/** Controlo segmentado (uma escolha entre poucas opções curtas). */
export function Segments<V extends string>({ options, valeur, onChange, style }: Props<V>) {
  const styles = useStyles();
  return (
    <View accessibilityRole="radiogroup" style={[styles.segments, style]}>
      {options.map((option) => {
        const choisi = option.valeur === valeur;
        return (
          <Pressable
            key={option.valeur}
            accessibilityRole="radio"
            aria-checked={choisi}
            accessibilityLabel={option.accessibilityLabel}
            onPress={() => onChange(option.valeur)}
            style={[styles.segment, choisi && styles.segmentChoisi]}
          >
            <Text style={[styles.segmentTexte, choisi && styles.segmentTexteChoisi]}>
              {option.libelle}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Pastilhas (uma escolha entre opções com nomes mais longos, como as línguas). */
export function Puces<V extends string>({ options, valeur, onChange, style }: Props<V>) {
  const styles = useStyles();
  return (
    <View accessibilityRole="radiogroup" style={[styles.puces, style]}>
      {options.map((option) => {
        const choisie = option.valeur === valeur;
        return (
          <Pressable
            key={option.valeur}
            accessibilityRole="radio"
            aria-checked={choisie}
            accessibilityLabel={option.accessibilityLabel}
            onPress={() => onChange(option.valeur)}
            style={[styles.puce, choisie && styles.puceChoisie]}
          >
            <Text style={[styles.puceTexte, choisie && styles.puceTexteChoisie]}>
              {option.libelle}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = creerStyles((c) => ({
  segments: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 14,
    backgroundColor: c.discret,
  },
  segment: {
    flex: 1,
    minHeight: TOUCHE_MIN,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentChoisi: { backgroundColor: c.releve, boxShadow: "0 1px 3px rgba(21, 26, 45, 0.14)" },
  segmentTexte: { fontSize: 15, fontWeight: "500", color: c.encre2, textAlign: "center" },
  segmentTexteChoisi: { fontWeight: "700", color: c.encre },
  puces: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  puce: {
    minHeight: TOUCHE_MIN,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.ligne,
    backgroundColor: c.surface,
    justifyContent: "center",
  },
  puceChoisie: { backgroundColor: c.encre, borderColor: c.encre },
  puceTexte: { fontSize: 15, color: c.encre },
  puceTexteChoisie: { color: c.surPlein, fontWeight: "600" },
}));
