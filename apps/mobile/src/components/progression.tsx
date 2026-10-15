import { View } from "react-native";
import { useI18n } from "../i18n";
import { useTheme } from "../theme";

/** Barras de progresso das trocas da sessão. */
export function Progression({
  actuel,
  total,
  libelle,
}: {
  actuel: number;
  total: number;
  /** Por omissão, o progresso da sessão. */
  libelle?: string;
}) {
  const { couleurs } = useTheme();
  const { t } = useI18n();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={libelle ?? t.session.progression}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={actuel}
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
