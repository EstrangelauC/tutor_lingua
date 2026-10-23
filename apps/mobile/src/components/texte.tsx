import { Text as TextRN, type TextProps } from "react-native";
import { useI18n } from "../i18n";
import { TYPOGRAPHIE, useTheme, type VarianteTexte, type Couleurs } from "../theme";

/**
 * Componente de Texto Camille 2.0
 * Implementa a hierarquia tipográfica académica e suporte a RTL.
 */
export function Text({
  style,
  variante,
  color,
  ...props
}: TextProps & { variante?: VarianteTexte; color?: keyof Couleurs }) {
  const { rtl } = useI18n();
  const { couleurs } = useTheme();

  // Mapeamento de cores padrão por variante para evitar repetição no uso
  const couleurParDefaut: Record<VarianteTexte, keyof Couleurs> = {
    page: "encre",
    section: "encre",
    corps: "encre",
    description: "encre2",
    libelle: "encre",
    meta: "encre3",
    resultat: "encre",
    francais: "encre",
  };

  const corFinal = color
    ? couleurs[color]
    : variante
      ? couleurs[couleurParDefaut[variante]]
      : couleurs.encre;

  return (
    <TextRN
      {...props}
      style={[
        {
          writingDirection: rtl ? "rtl" : "ltr",
          textAlign: rtl ? "right" : "left",
        },
        variante && TYPOGRAPHIE[variante],
        { color: corFinal },
        style,
      ]}
    />
  );
}
