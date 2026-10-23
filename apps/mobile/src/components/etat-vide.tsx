import { View } from "react-native";
import { ESPACES, creerStyles } from "../theme";
import { Text } from "./texte";

interface Props {
  titre: string;
  description?: string;
  icone?: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * EtatVide
 * Estado visual para listas vazias ou ausência de dados.
 */
export function EtatVide({ titre, description, icone, action }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.base}>
      {icone && <View style={{ marginBottom: ESPACES.lg }}>{icone}</View>}
      <Text variante="section" style={{ textAlign: "center", marginBottom: ESPACES.sm }}>
        {titre}
      </Text>
      {description && (
        <Text variante="description" style={{ textAlign: "center", marginBottom: ESPACES.lg }}>
          {description}
        </Text>
      )}
      {action && <View style={{ marginTop: ESPACES.md }}>{action}</View>}
    </View>
  );
}

const useStyles = creerStyles(() => ({
  base: {
    padding: ESPACES.xxl,
    alignItems: "center",
    justifyContent: "center",
    gap: ESPACES.md,
  },
}));
