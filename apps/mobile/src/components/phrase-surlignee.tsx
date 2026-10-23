import { type TextStyle } from "react-native";
import { FRANCAIS } from "../i18n";
import { TYPOGRAPHIE, creerStyles } from "../theme";
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
  phrase: { ...TYPOGRAPHIE.francais, ...FRANCAIS, color: c.encre },
  errone: {
    backgroundColor: c.erreurDoux,
    color: c.erreur,
    textDecorationLine: "line-through",
  },
  corrige: { backgroundColor: c.succesDoux, color: c.succes, fontWeight: "600" },
}));
