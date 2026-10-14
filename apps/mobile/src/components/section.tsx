import type { ReactNode } from "react";
import { View } from "react-native";
import { creerStyles } from "../theme";
import { Text } from "./texte";

/** Título pequeno em maiúsculas seguido do conteúdo. */
export function Section({ titre, children }: { titre: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.titre}>
        {titre}
      </Text>
      {children}
    </View>
  );
}

const useStyles = creerStyles((c) => ({
  section: { gap: 10 },
  titre: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: c.encre2,
  },
}));
