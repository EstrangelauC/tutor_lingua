import { Redirect, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bouton } from "../components/bouton";
import { PhraseSurlignee } from "../components/phrase-surlignee";
import { ECHELLE, TACHES } from "../libelles";
import { useContexteSession } from "../session/session-context";
import { couleurs, serif } from "../theme";

export default function FeedbackSession() {
  const router = useRouter();
  const { config, feedback } = useContexteSession();

  if (!feedback) {
    return <Redirect href="/" />;
  }

  const rangEstime = ECHELLE.indexOf(feedback.niveauEstime);
  const rangCible = ECHELLE.indexOf(config.niveau);

  return (
    <SafeAreaView style={styles.ecran} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.entete}>
          <Text accessibilityRole="header" style={styles.titre}>
            Feedback da sessão
          </Text>
          <Text style={styles.sousTitre}>{TACHES[config.tache].titre}</Text>
        </View>

        <View style={styles.carte}>
          <Text style={styles.etiquette}>Nível estimado</Text>
          <Text style={styles.niveau}>{feedback.niveauEstime}</Text>
          <Text style={styles.resume}>{feedback.resume}</Text>
          <View
            accessible
            accessibilityLabel={`Escala de A1 a B2: ${feedback.niveauEstime} estimado, ${config.niveau} objetivo`}
            style={styles.echelle}
          >
            {ECHELLE.map((niveau, i) => (
              <View key={niveau} style={styles.echelon}>
                <View
                  style={[
                    styles.barre,
                    i <= rangEstime
                      ? styles.barreAtteinte
                      : i === rangCible
                        ? styles.barreCible
                        : styles.barreVide,
                  ]}
                />
                <Text style={[styles.echelonTexte, i === rangEstime && styles.echelonEstime]}>
                  {niveau}
                </Text>
                {i === rangCible && <Text style={styles.echelonNote}>objetivo</Text>}
              </View>
            ))}
          </View>
          <Text style={styles.note}>
            Estimativa com base nesta sessão. Não é uma nota oficial do TCF.
          </Text>
        </View>

        <Text accessibilityRole="header" style={styles.sectionTitre}>
          {feedback.erreurs.length > 0
            ? "As correções mais importantes"
            : "Sem erros importantes nesta sessão"}
        </Text>
        {feedback.erreurs.map((erreur, i) => (
          <View key={i} style={styles.carte}>
            <View style={styles.erreurTete}>
              <View style={styles.numero}>
                <Text style={styles.numeroTexte}>{i + 1}</Text>
              </View>
              <Text style={styles.erreurTitre}>{erreur.titre}</Text>
            </View>
            <View style={styles.bloc}>
              <Text style={[styles.libelle, { color: couleurs.ecouteEncre }]}>O que disseste</Text>
              <PhraseSurlignee
                phrase={erreur.ditParLEleve}
                extrait={erreur.extraitErrone}
                type="errone"
              />
            </View>
            <View style={styles.bloc}>
              <Text style={[styles.libelle, { color: couleurs.bleuEncre }]}>Forma correta</Text>
              <PhraseSurlignee
                phrase={erreur.formeCorrecte}
                extrait={erreur.extraitCorrige}
                type="corrige"
              />
            </View>
            <Text style={styles.explication}>{erreur.explication}</Text>
          </View>
        ))}

        <View style={[styles.carte, styles.conseil]}>
          <Text style={styles.conseilTitre}>Para a próxima sessão</Text>
          <Text style={styles.conseilTexte}>{feedback.conseil}</Text>
        </View>

        <View style={styles.actions}>
          <Bouton libelle="Repetir esta tarefa" onPress={() => router.replace("/session")} />
          <Bouton
            libelle="Nova tarefa"
            variante="secondaire"
            onPress={() => router.dismissTo("/")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: 20, gap: 16 },
  entete: { gap: 4 },
  titre: { fontSize: 26, fontWeight: "600", color: couleurs.encre },
  sousTitre: { fontFamily: serif, fontSize: 16, color: couleurs.encre2 },
  carte: {
    padding: 18,
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    backgroundColor: couleurs.surface,
  },
  etiquette: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: couleurs.encre2,
  },
  niveau: { fontSize: 64, lineHeight: 70, fontWeight: "600", color: couleurs.bleu },
  resume: { fontSize: 17, lineHeight: 24, fontWeight: "500", color: couleurs.encre },
  echelle: { flexDirection: "row", gap: 4 },
  echelon: { flex: 1, gap: 6 },
  barre: { height: 12, borderRadius: 6 },
  barreAtteinte: { backgroundColor: couleurs.bleu },
  barreCible: {
    backgroundColor: couleurs.bleuDoux,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#7C93E6",
  },
  barreVide: { backgroundColor: couleurs.discret },
  echelonTexte: { fontSize: 13, fontWeight: "600", color: couleurs.encre2 },
  echelonEstime: { color: couleurs.encre, fontWeight: "700" },
  echelonNote: { fontSize: 12, color: couleurs.encre2 },
  note: { fontSize: 13, lineHeight: 19, color: couleurs.encre2 },
  sectionTitre: { fontSize: 18, fontWeight: "600", color: couleurs.encre, marginTop: 8 },
  erreurTete: { flexDirection: "row", alignItems: "center", gap: 10 },
  numero: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: couleurs.encre,
    alignItems: "center",
    justifyContent: "center",
  },
  numeroTexte: { color: couleurs.blanc, fontSize: 13, fontWeight: "600" },
  erreurTitre: { flex: 1, fontSize: 16, fontWeight: "600", color: couleurs.encre },
  bloc: { gap: 4 },
  libelle: { fontSize: 12, fontWeight: "600" },
  explication: { fontSize: 14, lineHeight: 21, color: couleurs.encre2 },
  conseil: { backgroundColor: couleurs.bleuDoux, borderColor: couleurs.bleuDoux },
  conseilTitre: { fontSize: 16, fontWeight: "600", color: couleurs.bleuEncre },
  conseilTexte: { fontSize: 15, lineHeight: 22, color: couleurs.encre },
  actions: { gap: 10, marginTop: 8 },
});
