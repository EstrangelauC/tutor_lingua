import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { styleDirection, useI18n } from "../i18n";
import { useTheme } from "../theme";

/** Raiz de cada ecrã: margens seguras, cor de fundo do tema e direção da língua (RTL em árabe). */
export function Ecran({
  children,
  bords = ["top", "bottom"],
  style,
}: {
  children: ReactNode;
  bords?: Edge[];
  style?: StyleProp<ViewStyle>;
}) {
  const { couleurs } = useTheme();
  const { rtl } = useI18n();
  return (
    <SafeAreaView
      edges={bords}
      style={[{ flex: 1, backgroundColor: couleurs.fond }, styleDirection(rtl), style]}
    >
      {children}
    </SafeAreaView>
  );
}
