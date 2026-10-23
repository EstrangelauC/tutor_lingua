import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { ESPACES } from "../theme";
import { EnteteSection } from "./entete";

/**
 * Section
 * Agrupador de conteúdo com título, garantindo espaçamento consistente.
 */
export function Section({
  titre,
  children,
  style,
}: {
  titre: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ gap: ESPACES.md }, style]}>
      <EnteteSection titre={titre} />
      {children}
    </View>
  );
}
