import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { TOUCHE_MIN, couleurs } from "../theme";

interface Props {
  libelle: string;
  onPress: () => void;
  variante?: "principal" | "secondaire" | "discret";
  desactive?: boolean;
  chargement?: boolean;
  style?: ViewStyle;
}

export function Bouton({
  libelle,
  onPress,
  variante = "principal",
  desactive = false,
  chargement = false,
  style,
}: Props) {
  const inactif = desactive || chargement;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactif, busy: chargement }}
      disabled={inactif}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variante],
        inactif && styles.inactif,
        pressed && !inactif && styles.presse,
        style,
      ]}
    >
      {chargement ? (
        <ActivityIndicator color={variante === "principal" ? couleurs.blanc : couleurs.bleu} />
      ) : (
        <Text
          style={[
            styles.texte,
            variante === "principal" ? styles.textePrincipal : styles.texteAutre,
          ]}
        >
          {libelle}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCHE_MIN + 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  principal: { backgroundColor: couleurs.bleu },
  secondaire: {
    backgroundColor: couleurs.surface,
    borderWidth: 1,
    borderColor: couleurs.ligne,
  },
  discret: { backgroundColor: "transparent", minHeight: TOUCHE_MIN },
  inactif: { opacity: 0.5 },
  presse: { opacity: 0.85 },
  texte: { fontSize: 17, fontWeight: "600", textAlign: "center" },
  textePrincipal: { color: couleurs.blanc },
  texteAutre: { color: couleurs.encre },
});
