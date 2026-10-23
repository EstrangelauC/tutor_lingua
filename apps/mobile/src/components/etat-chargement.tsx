import { View } from "react-native";
import { ESPACES, creerStyles } from "../theme";
import { Text } from "./texte";

interface Props {
  libelle?: string;
  couleur?: string;
}

export function EtatChargement({ libelle, couleur }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.base}>
      <View style={[styles.spinner, { borderColor: couleur || "transparent" }]} />
      {libelle && (
        <Text style={{ color: couleur, marginLeft: ESPACES.sm }} variante="libelle">
          {libelle}...
        </Text>
      )}
    </View>
  );
}

const useStyles = creerStyles(() => ({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderTopColor: "transparent",
  },
}));
