import { StyleSheet, Text, type TextStyle } from "react-native";
import { couleurs, serif } from "../theme";

interface Props {
  phrase: string;
  extrait: string;
  type: "errone" | "corrige";
}

/** Frase em francês com o trecho errado (riscado) ou corrigido (destacado). */
export function PhraseSurlignee({ phrase, extrait, type }: Props) {
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

const styles = StyleSheet.create({
  phrase: { fontFamily: serif, fontSize: 17, lineHeight: 25, color: couleurs.encre },
  errone: {
    backgroundColor: couleurs.ecouteDoux,
    color: couleurs.ecouteEncre,
    textDecorationLine: "line-through",
  },
  corrige: { backgroundColor: couleurs.bleuDoux, color: couleurs.bleuEncre, fontWeight: "600" },
});
