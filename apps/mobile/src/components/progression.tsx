import { View } from "react-native";
import { couleurs } from "../theme";

/** Barras de progresso das trocas da sessão. */
export function Progression({ actuel, total }: { actuel: number; total: number }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Progresso da sessão"
      accessibilityValue={{ min: 0, max: total, now: actuel }}
      style={{ flexDirection: "row", gap: 4 }}
    >
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: i < actuel ? couleurs.bleu : couleurs.ligne,
          }}
        />
      ))}
    </View>
  );
}
