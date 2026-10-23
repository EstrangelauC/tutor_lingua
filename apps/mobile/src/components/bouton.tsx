import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import { ESPACES, RAYONS, TOUCHE_MIN, creerStyles, useTheme } from "../theme";
import { EtatChargement } from "./etat-chargement";
import { Text } from "./texte";

interface Props {
  libelle: string;
  onPress: () => void;
  variante?: "principal" | "secondaire" | "danger" | "fantome";
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
  const { couleurs: c } = useTheme();
  const inactif = desactive || chargement;

  // Determinação da cor do texto baseada na variante e estado
  const getColor = () => {
    if (desactive) return c.surInactif;
    switch (variante) {
      case "principal":
        return c.surPrimaire;
      case "secondaire":
        return c.primaire;
      case "danger":
        return c.surPrimaire;
      case "fantome":
        return c.primaire;
      default:
        return c.surPrimaire;
    }
  };

  const couleurTexto = getColor();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={libelle}
      disabled={inactif}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variante],
        desactive && styles.inactif,
        pressed && !inactif && styles.presse,
        style,
      ]}
    >
      {chargement ? (
        <EtatChargement libelle={libelle} couleur={couleurTexto} />
      ) : (
        <Text
          variante="libelle"
          color={
            desactive
              ? "surInactif"
              : variante === "principal" || variante === "danger"
                ? "surPrimaire"
                : "primaire"
          }
          style={{ textAlign: "center", flexShrink: 1 }}
        >
          {libelle}
        </Text>
      )}
    </Pressable>
  );
}

const useStyles = creerStyles((c) => ({
  base: {
    minHeight: TOUCHE_MIN,
    paddingHorizontal: ESPACES.xl,
    paddingVertical: ESPACES.md,
    borderRadius: RAYONS.controle,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  principal: {
    backgroundColor: c.primaire,
    borderColor: c.primaire,
  },
  secondaire: {
    backgroundColor: c.surface,
    borderColor: c.ligne,
  },
  danger: {
    backgroundColor: c.erreur,
    borderColor: c.erreur,
  },
  fantome: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  inactif: {
    backgroundColor: c.inactif,
    borderColor: c.inactif,
  },
  presse: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
}));
