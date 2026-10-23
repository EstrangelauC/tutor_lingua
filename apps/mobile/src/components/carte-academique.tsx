import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { ESPACES, RAYONS, creerStyles, useTheme } from "../theme";

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
}

/**
 * CarteAcademique
 * Container élégant pour grouper le contenu lié.
 */
export function CarteAcademique({ children, style, accent = false }: Props) {
  const styles = useStyles();
  const { couleurs: c } = useTheme();

  return (
    <View
      style={[
        styles.base,
        accent
          ? { borderColor: c.bleu, backgroundColor: c.bleuDoux }
          : { borderColor: c.ligne, backgroundColor: c.surface },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const useStyles = creerStyles((c) => ({
  base: {
    borderRadius: RAYONS.carte,
    padding: ESPACES.lg,
    borderWidth: 1,
    shadowColor: c.encre,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
}));
