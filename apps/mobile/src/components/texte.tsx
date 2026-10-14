import { Text as TextRN, type TextProps } from "react-native";
import { useI18n } from "../i18n";

/**
 * O Text do React Native com a direção da língua da interface. Sem isto, um texto só com
 * letras latinas («B1», «Interaction») fica encostado à esquerda mesmo com a interface em
 * árabe. O francês sobrepõe-se com o estilo FRANCAIS (sempre LTR).
 */
export function Text({ style, ...props }: TextProps) {
  const { rtl } = useI18n();
  return <TextRN {...props} style={[{ writingDirection: rtl ? "rtl" : "ltr" }, style]} />;
}
