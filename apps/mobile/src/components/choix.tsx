import type { KeyboardEvent } from "react";
import { useI18n } from "../i18n";
import { Platform, Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { ESPACES, RAYONS, TOUCHE_MIN, creerStyles } from "../theme";
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

/**
 * Segments
 * Controlo segmentado para poucas opções curtas, com estética profissional.
 */
export function Segments<V extends string>({ options, valeur, onChange, style }: Props<V>) {
  const styles = useStyles();
  const { rtl } = useI18n();
  return (
    <View accessibilityRole="radiogroup" style={[styles.segments, style]}>
      {options.map((option, index) => {
        const choisi = option.valeur === valeur;
        return (
          <Pressable
            key={option.valeur}
            {...clavierChoix(options, index, valeur, onChange, rtl)}
            accessibilityRole="radio"
            aria-checked={choisi}
            accessibilityLabel={option.accessibilityLabel}
            onPress={() => onChange(option.valeur)}
            style={[styles.segment, choisi && styles.segmentChoisi]}
          >
            <Text
              variante="libelle"
              color={choisi ? "surPrimaire" : "encre2"}
              style={[styles.segmentTexte, choisi && styles.segmentTexteChoisi]}
            >
              {option.libelle}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * CaseACocher
 * Caixa de seleção com legenda e linha de ajuda.
 */
export function CaseACocher({
  coche,
  libelle,
  aide,
  onChange,
}: {
  coche: boolean;
  libelle: string;
  aide?: string;
  onChange: (coche: boolean) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.caseBloc}>
      <Pressable
        {...(Platform.OS === "web"
          ? {
              onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
                if (event.key === " ") {
                  event.preventDefault();
                  if (!event.repeat) onChange(!coche);
                }
              },
            }
          : {})}
        accessibilityRole="checkbox"
        aria-checked={coche}
        onPress={() => onChange(!coche)}
        style={styles.case}
      >
        <View style={[styles.caseCarre, coche && styles.caseCochee]}>
          {coche && <Text style={styles.caseCoche}>✓</Text>}
        </View>
        <Text variante="corps" style={styles.caseTexte}>
          {libelle}
        </Text>
      </Pressable>
      {aide && (
        <Text variante="meta" style={styles.caseAide}>
          {aide}
        </Text>
      )}
    </View>
  );
}

/**
 * Puces
 * Seleção de opções com nomes longos (ex: línguas), estilo "pílulas".
 */
export function Puces<V extends string>({ options, valeur, onChange, style }: Props<V>) {
  const styles = useStyles();
  const { rtl } = useI18n();
  return (
    <View accessibilityRole="radiogroup" style={[styles.puces, style]}>
      {options.map((option, index) => {
        const choisie = option.valeur === valeur;
        return (
          <Pressable
            key={option.valeur}
            {...clavierChoix(options, index, valeur, onChange, rtl)}
            accessibilityRole="radio"
            aria-checked={choisie}
            accessibilityLabel={option.accessibilityLabel}
            onPress={() => onChange(option.valeur)}
            style={[styles.puce, choisie && styles.puceChoisie]}
          >
            <Text
              variante="description"
              color={choisie ? "surPrimaire" : "encre"}
              style={[styles.puceTexte, choisie && styles.puceTexteChoisie]}
            >
              {option.libelle}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function clavierChoix<V extends string>(
  options: readonly OptionChoix<V>[],
  index: number,
  valeur: V,
  onChange: (valeur: V) => void,
  rtl: boolean,
) {
  if (Platform.OS !== "web") return {};
  return {
    tabIndex: options[index]?.valeur === valeur ? (0 as const) : (-1 as const),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      const key = event.key;
      if (![" ", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"].includes(key))
        return;
      event.preventDefault();
      if (event.repeat && key === " ") return;
      let prochain = index;
      if (key === "Home") prochain = 0;
      else if (key === "End") prochain = options.length - 1;
      else if (key !== " ") {
        const avance =
          key === "ArrowDown" || (key === "ArrowRight" && !rtl) || (key === "ArrowLeft" && rtl);
        prochain = (index + (avance ? 1 : -1) + options.length) % options.length;
      }
      const option = options[prochain];
      if (!option) return;
      const radios =
        event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="radio"]');
      radios?.[prochain]?.focus();
      onChange(option.valeur);
    },
  };
}

const useStyles = creerStyles((c) => ({
  segments: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ESPACES.xs,
    padding: ESPACES.xs,
    borderRadius: RAYONS.controle,
    backgroundColor: c.discret,
  },
  segment: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 96,
    minHeight: TOUCHE_MIN,
    paddingHorizontal: ESPACES.sm,
    borderRadius: RAYONS.petit,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentChoisi: { backgroundColor: c.primaire },
  segmentTexte: { textAlign: "center" },
  segmentTexteChoisi: { fontWeight: "700" },
  puces: { flexDirection: "row", flexWrap: "wrap", gap: ESPACES.sm },
  puce: {
    maxWidth: "100%",
    paddingVertical: ESPACES.sm,
    minHeight: TOUCHE_MIN,
    paddingHorizontal: ESPACES.lg,
    borderRadius: RAYONS.controle,
    borderWidth: 1,
    borderColor: c.ligne,
    backgroundColor: c.surface,
    justifyContent: "center",
  },
  puceChoisie: { backgroundColor: c.primaire, borderColor: c.primaire },
  puceTexte: {},
  puceTexteChoisie: { fontWeight: "600" },
  caseBloc: { gap: 4 },
  case: { flexDirection: "row", alignItems: "center", gap: ESPACES.md, minHeight: TOUCHE_MIN },
  caseCarre: {
    width: 24,
    height: 24,
    borderRadius: RAYONS.petit,
    borderWidth: 2,
    borderColor: c.ligne,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  caseCochee: { backgroundColor: c.bleu, borderColor: c.bleu },
  caseCoche: { color: c.surPrimaire, fontSize: 14, fontWeight: "700", lineHeight: 16 },
  caseTexte: { flex: 1 },
  caseAide: { marginLeft: ESPACES.md },
}));
