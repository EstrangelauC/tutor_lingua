import { View } from "react-native";
import { ESPACES, RAYONS, creerStyles, useTheme } from "../theme";
import { Text } from "./texte";

interface Props {
  tipo: "sucesso" | "erro" | "info";
  mensagem: string;
  titulo?: string;
}

export function CarteFeedback({ tipo, mensagem, titulo }: Props) {
  const styles = useStyles();
  const { couleurs: c } = useTheme();

  const config = {
    sucesso: { bg: c.succesDoux, border: c.succes, text: c.succes },
    erro: { bg: c.erreurDoux, border: c.erreur, text: c.erreur },
    info: { bg: c.bleuDoux, border: c.bleu, text: c.bleuEncre },
  };

  const { bg, border, text } = config[tipo];

  return (
    <View style={[styles.base, { backgroundColor: bg, borderColor: border }]}>
      {titulo && (
        <Text
          style={{ color: text, fontWeight: "700", marginBottom: ESPACES.xs }}
          variante="libelle"
        >
          {titulo}
        </Text>
      )}
      <Text style={{ color: text }} variante="description">
        {mensagem}
      </Text>
    </View>
  );
}

const useStyles = creerStyles(() => ({
  base: {
    padding: ESPACES.md,
    borderRadius: RAYONS.controle,
    borderLeftWidth: 4,
    gap: ESPACES.xs,
  },
}));
