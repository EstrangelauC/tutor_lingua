import { View } from "react-native";
import { ESPACES, RAYONS, creerStyles, useTheme } from "../theme";
import { Text } from "./texte";

interface Props {
  niveau: string | number;
  atteint?: boolean;
  couleur?: "primaire" | "succes" | "warning";
}

export function BadgeNiveau({ niveau, atteint, couleur }: Props) {
  const styles = useStyles();
  const { couleurs: c } = useTheme();

  // Se a 'atteint' est fourni, on utilise succès/primaire. Sinon, on utilise 'couleur'.
  const corFinale =
    atteint !== undefined ? (atteint ? "succes" : "primaire") : couleur || "primaire";

  const cores = {
    primaire: { bg: c.bleuDoux, text: c.bleuEncre },
    succes: { bg: c.succesDoux, text: c.succes },
    warning: { bg: c.avertissementDoux, text: c.avertissement },
  };

  const { bg, text } = cores[corFinale];

  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text style={{ color: text, fontWeight: "700" }} variante="meta">
        {niveau}
      </Text>
    </View>
  );
}

const useStyles = creerStyles(() => ({
  base: {
    paddingHorizontal: ESPACES.sm,
    paddingVertical: 2,
    borderRadius: RAYONS.pilule,
    alignItems: "center",
    justifyContent: "center",
  },
}));
