import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { styleDirection, useI18n } from "../i18n";
import { creerStyles } from "../theme";

/**
 * Ecran
 * Raiz de cada ecrã: margens seguras, cor de fundo do tema e direção da língua.
 */
export function Ecran({
  children,
  bords = ["top", "bottom"],
  style,
}: {
  children: ReactNode;
  bords?: Edge[];
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  const { rtl } = useI18n();
  return (
    <SafeAreaView edges={bords} style={[styles.base, styleDirection(rtl), style]}>
      {children}
    </SafeAreaView>
  );
}

const useStyles = creerStyles((c) => ({
  base: {
    flex: 1,
    minWidth: 0,
    backgroundColor: c.fond,
  },
}));
