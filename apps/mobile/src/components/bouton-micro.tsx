import { Pressable, View } from "react-native";
import { creerStyles } from "../theme";

interface Props {
  enregistre: boolean;
  desactive: boolean;
  /** "maintenir": premir para falar; "basculer": um toque começa, outro envia (mãos-livres). */
  mode: "maintenir" | "basculer";
  onDebut: () => void;
  onFin: () => void;
  accessibilityLabel: string;
}

/** Botão grande do microfone (88 px), na zona do polegar. */
export function BoutonMicro({
  enregistre,
  desactive,
  mode,
  onDebut,
  onFin,
  accessibilityLabel,
}: Props) {
  const styles = useStyles();
  const actions =
    mode === "maintenir"
      ? { onPressIn: onDebut, onPressOut: onFin }
      : { onPress: enregistre ? onFin : onDebut };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      aria-disabled={desactive}
      disabled={desactive}
      {...actions}
      style={({ pressed }) => [
        styles.bouton,
        enregistre ? styles.enregistre : styles.pret,
        desactive && styles.desactive,
        pressed && !desactive && styles.presse,
      ]}
    >
      {enregistre ? (
        <View style={styles.carre} />
      ) : (
        <View style={styles.micro}>
          <View style={[styles.capsule, desactive && styles.capsuleDesactivee]} />
          <View style={[styles.pied, desactive && styles.capsuleDesactivee]} />
        </View>
      )}
    </Pressable>
  );
}

const useStyles = creerStyles((c) => ({
  bouton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pret: { backgroundColor: c.bleu },
  enregistre: { backgroundColor: c.ecoute, transform: [{ scale: 1.06 }] },
  desactive: { backgroundColor: c.ligne },
  presse: { opacity: 0.85 },
  carre: { width: 28, height: 28, borderRadius: 6, backgroundColor: c.surPlein },
  micro: { alignItems: "center", gap: 3 },
  capsule: { width: 16, height: 26, borderRadius: 8, backgroundColor: c.surPlein },
  pied: { width: 4, height: 8, borderRadius: 2, backgroundColor: c.surPlein },
  capsuleDesactivee: { backgroundColor: c.encre3 },
}));
