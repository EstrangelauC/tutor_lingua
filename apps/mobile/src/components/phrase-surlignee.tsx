import { type TextStyle } from "react-native";
import { FRANCAIS } from "../i18n";
import { creerStyles } from "../theme";
import { Text } from "./texte";

interface Props {
  phrase: string;
  extrait: string;
  type: "errone" | "corrige";
}

/** Frase em francês com o trecho errado (riscado) ou corrigido (destacado). */
export function PhraseSurlignee({ phrase, extrait, type }: Props) {
  const styles = useStyles();
  const index = extrait ? phrase.indexOf(extrait) : -1;
  const style: TextStyle = type === "errone" ? styles.errone : styles.corrige;

  // Espaços inquebráveis dentro das aspas, como na tipografia francesa.
  if (index < 0) {
    return <Text style={styles.phrase}>{`«\u00A0${phrase}\u00A0»`}</Text>;
  }
  return (
    <Text style={styles.phrase}>
      {`«\u00A0${phrase.slice(0, index)}`}
      <Text style={style}>{extrait}</Text>
      {`${phrase.slice(index + extrait.length)}\u00A0»`}
    </Text>
  );
}

const useStyles = creerStyles((c) => ({
  phrase: { ...FRANCAIS, fontSize: 17, lineHeight: 25, color: c.encre },
  errone: {
    backgroundColor: c.ecouteDoux,
    color: c.ecouteEncre,
    textDecorationLine: "line-through",
  },
  corrige: { backgroundColor: c.bleuDoux, color: c.bleuEncre, fontWeight: "600" },
}));
