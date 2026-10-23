import type { ReactNode } from "react";
import { View } from "react-native";
import { ESPACES, useTheme } from "../theme";
import { Text } from "./texte";

export function EntetePage({
  titre,
  description,
  action,
}: {
  titre: string;
  description?: string;
  action?: ReactNode;
}) {
  const { couleurs } = useTheme();
  return (
    <View style={{ gap: ESPACES.sm }}>
      <Text variante="page" accessibilityRole="header">
        {titre}
      </Text>
      {description && (
        <Text variante="description" style={{ color: couleurs.encre2 }}>
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}
export function EnteteSection({ titre }: { titre: string }) {
  return (
    <Text variante="section" accessibilityRole="header">
      {titre}
    </Text>
  );
}
