import { Pressable, StyleSheet, View } from "react-native";
import { couleurs } from "../theme";

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
  const actions =
    mode === "maintenir"
      ? { onPressIn: onDebut, onPressOut: onFin }
      : { onPress: enregistre ? onFin : onDebut };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: desactive, selected: enregistre }}
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

const styles = StyleSheet.create({
  bouton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pret: { backgroundColor: couleurs.bleu },
  enregistre: { backgroundColor: couleurs.ecoute, transform: [{ scale: 1.06 }] },
  desactive: { backgroundColor: couleurs.ligne },
  presse: { opacity: 0.85 },
  carre: { width: 28, height: 28, borderRadius: 6, backgroundColor: couleurs.blanc },
  micro: { alignItems: "center", gap: 3 },
  capsule: { width: 16, height: 26, borderRadius: 8, backgroundColor: couleurs.blanc },
  pied: { width: 4, height: 8, borderRadius: 2, backgroundColor: couleurs.blanc },
  capsuleDesactivee: { backgroundColor: couleurs.encre3 },
});
