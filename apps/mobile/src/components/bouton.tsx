import { ActivityIndicator, Pressable, type StyleProp, type ViewStyle } from "react-native";
import { TOUCHE_MIN, creerStyles, useTheme } from "../theme";
import { Text } from "./texte";

interface Props {
  libelle: string;
  onPress: () => void;
  variante?: "principal" | "secondaire" | "danger";
  desactive?: boolean;
  chargement?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Bouton({
  libelle,
  onPress,
  variante = "principal",
  desactive = false,
  chargement = false,
  style,
}: Props) {
  const styles = useStyles();
  const { couleurs } = useTheme();
  const inactif = desactive || chargement;
  const plein = variante !== "secondaire";
  return (
    <Pressable
      accessibilityRole="button"
      aria-disabled={inactif}
      aria-busy={chargement}
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
        <ActivityIndicator color={plein ? couleurs.surPlein : couleurs.bleu} />
      ) : (
        <Text style={[styles.texte, plein ? styles.textePlein : styles.texteSecondaire]}>
          {libelle}
        </Text>
      )}
    </Pressable>
  );
}

const useStyles = creerStyles((c) => ({
  base: {
    minHeight: TOUCHE_MIN + 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  principal: { backgroundColor: c.bleu },
  secondaire: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.ligne,
  },
  danger: { backgroundColor: c.ecoute },
  inactif: { opacity: 0.5 },
  presse: { opacity: 0.85 },
  texte: { fontSize: 17, fontWeight: "600", textAlign: "center" },
  textePlein: { color: c.surPlein },
  texteSecondaire: { color: c.encre },
}));
