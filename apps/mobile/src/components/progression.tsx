import { View } from "react-native";
import { ESPACES, RAYONS, creerStyles, useTheme } from "../theme";
import { Text } from "./texte";

interface Props {
  actuel: number;
  total: number;
  libelle?: string;
  altura?: number;
}

export function Progression({ actuel, total, libelle, altura = 8 }: Props) {
  const styles = useStyles();
  const { couleurs: c } = useTheme();

  const percentual = Math.min(Math.max((actuel / total) * 100, 0), 100);

  return (
    <View style={{ gap: ESPACES.xs }}>
      {libelle && (
        <Text variante="meta" style={{ textAlign: "right" }}>
          {libelle} {Math.round(percentual)}%
        </Text>
      )}
      <View style={[styles.track, { height: altura }]}>
        <View style={[styles.fill, { width: `${percentual}%`, backgroundColor: c.bleu }]} />
      </View>
    </View>
  );
}

const useStyles = creerStyles((c) => ({
  track: {
    backgroundColor: c.discret,
    borderRadius: RAYONS.pilule,
    overflow: "hidden",
  },
  fill: {
    borderRadius: RAYONS.pilule,
  },
}));
