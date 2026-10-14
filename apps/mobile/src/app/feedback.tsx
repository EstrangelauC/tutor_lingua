import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { Bouton } from "../components/bouton";
import { Ecran } from "../components/ecran";
import { IconeRetour } from "../components/icones";
import { PhraseSurlignee } from "../components/phrase-surlignee";
import { useDonnees } from "../donnees/donnees-context";
import { dateCourte, estRtl, styleTexte, useI18n } from "../i18n";
import { ECHELLE, TACHES } from "../taches";
import { TOUCHE_MIN, creerStyles, serif, useTheme } from "../theme";
import { Text } from "../components/texte";

/** Feedback de uma sessão do histórico (a acabada de terminar ou uma antiga). */
export default function FeedbackSession() {
  const router = useRouter();
  const styles = useStyles();
  const { couleurs } = useTheme();
  const { t, rtl, locale } = useI18n();
  const { historique } = useDonnees();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const entree = historique.find((e) => e.id === id);

  const retour = () => (router.canGoBack() ? router.back() : router.replace("/"));

  const barre = (
    <View style={styles.barre}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.communs.retour}
        onPress={retour}
        style={styles.retour}
      >
        <IconeRetour couleur={couleurs.encre} miroir={rtl} />
      </Pressable>
    </View>
  );

  if (!entree) {
    return (
      <Ecran>
        {barre}
        <View style={styles.introuvable}>
          <Text style={styles.resume}>{t.feedback.introuvable}</Text>
          <Bouton libelle={t.communs.retour} onPress={retour} />
        </View>
      </Ecran>
    );
  }

  const { feedback } = entree;
  // O conteúdo do feedback vem na língua de apoio, que pode ter outra direção que a interface.
  const texteAppui = styleTexte(estRtl(entree.langueAppui));
  const rangEstime = ECHELLE.indexOf(feedback.niveauEstime);
  const rangCible = ECHELLE.indexOf(entree.niveau);

  return (
    <Ecran>
      {barre}
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.entete}>
          <Text accessibilityRole="header" style={styles.titre}>
            {t.feedback.titre}
          </Text>
          <Text style={styles.sousTitre}>
            <Text style={styles.serif}>{TACHES[entree.tache].titre}</Text>
            {` · ${dateCourte(entree.date, locale)}`}
          </Text>
        </View>

        <View style={styles.carte}>
          <Text style={styles.etiquette}>{t.feedback.niveauEstime}</Text>
          <Text style={styles.niveau}>{feedback.niveauEstime}</Text>
          <Text style={[styles.resume, texteAppui]}>{feedback.resume}</Text>
          <View
            accessible
            accessibilityLabel={t.feedback.echelle(feedback.niveauEstime, entree.niveau)}
            style={styles.echelle}
          >
            {ECHELLE.map((niveau, i) => (
              <View key={niveau} style={styles.echelon}>
                <View
                  style={[
                    styles.barreNiveau,
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
                {i === rangCible && <Text style={styles.echelonNote}>{t.feedback.objectif}</Text>}
              </View>
            ))}
          </View>
          <Text style={styles.note}>{t.feedback.note}</Text>
        </View>

        <Text accessibilityRole="header" style={styles.sectionTitre}>
          {feedback.erreurs.length > 0 ? t.feedback.corrections : t.feedback.sansErreur}
        </Text>
        {feedback.erreurs.map((erreur, i) => (
          <View key={i} style={styles.carte}>
            <View style={styles.erreurTete}>
              <View style={styles.numero}>
                <Text style={styles.numeroTexte}>{i + 1}</Text>
              </View>
              <Text style={[styles.erreurTitre, texteAppui]}>{erreur.titre}</Text>
            </View>
            <View style={styles.bloc}>
              <Text style={[styles.libelle, styles.libelleErrone]}>{t.feedback.ceQueTuAsDit}</Text>
              <PhraseSurlignee
                phrase={erreur.ditParLEleve}
                extrait={erreur.extraitErrone}
                type="errone"
              />
            </View>
            <View style={styles.bloc}>
              <Text style={[styles.libelle, styles.libelleCorrige]}>
                {t.feedback.formeCorrecte}
              </Text>
              <PhraseSurlignee
                phrase={erreur.formeCorrecte}
                extrait={erreur.extraitCorrige}
                type="corrige"
              />
            </View>
            <Text style={[styles.explication, texteAppui]}>{erreur.explication}</Text>
          </View>
        ))}

        <View style={[styles.carte, styles.conseil]}>
          <Text style={styles.conseilTitre}>{t.feedback.prochaine}</Text>
          <Text style={[styles.conseilTexte, texteAppui]}>{feedback.conseil}</Text>
        </View>

        <View style={styles.actions}>
          <Bouton
            libelle={t.feedback.repeter}
            onPress={() =>
              router.replace({ pathname: "/session", params: { tache: entree.tache } })
            }
          />
          <Bouton
            libelle={t.feedback.nouvelle}
            variante="secondaire"
            onPress={() => router.dismissTo("/")}
          />
        </View>
      </ScrollView>
    </Ecran>
  );
}

const useStyles = creerStyles((c) => ({
  barre: { flexDirection: "row", paddingHorizontal: 8, paddingTop: 4 },
  retour: {
    width: TOUCHE_MIN,
    height: TOUCHE_MIN,
    borderRadius: TOUCHE_MIN / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  introuvable: { flex: 1, justifyContent: "center", gap: 16, padding: 20 },
  contenu: { padding: 20, paddingTop: 4, gap: 16 },
  entete: { gap: 4 },
  titre: { fontSize: 26, fontWeight: "600", color: c.encre },
  sousTitre: { fontSize: 15, color: c.encre2 },
  serif: { fontFamily: serif, fontSize: 16 },
  carte: {
    padding: 18,
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.ligne,
    backgroundColor: c.surface,
  },
  etiquette: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: c.encre2,
  },
  niveau: { fontSize: 64, lineHeight: 70, fontWeight: "600", color: c.bleu },
  resume: { fontSize: 17, lineHeight: 24, fontWeight: "500", color: c.encre },
  echelle: { flexDirection: "row", gap: 4 },
  echelon: { flex: 1, gap: 6 },
  barreNiveau: { height: 12, borderRadius: 6 },
  barreAtteinte: { backgroundColor: c.bleu },
  barreCible: {
    backgroundColor: c.bleuDoux,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: c.bleuTrait,
  },
  barreVide: { backgroundColor: c.discret },
  echelonTexte: { fontSize: 13, fontWeight: "600", color: c.encre2 },
  echelonEstime: { color: c.encre, fontWeight: "700" },
  echelonNote: { fontSize: 12, color: c.encre2 },
  note: { fontSize: 13, lineHeight: 19, color: c.encre2 },
  sectionTitre: { fontSize: 18, fontWeight: "600", color: c.encre, marginTop: 8 },
  erreurTete: { flexDirection: "row", alignItems: "center", gap: 10 },
  numero: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: c.encre,
    alignItems: "center",
    justifyContent: "center",
  },
  numeroTexte: { color: c.surPlein, fontSize: 13, fontWeight: "600" },
  erreurTitre: { flex: 1, fontSize: 16, fontWeight: "600", color: c.encre },
  bloc: { gap: 4 },
  libelle: { fontSize: 12, fontWeight: "600" },
  libelleErrone: { color: c.ecouteEncre },
  libelleCorrige: { color: c.bleuEncre },
  explication: { fontSize: 14, lineHeight: 21, color: c.encre2 },
  conseil: { backgroundColor: c.bleuDoux, borderColor: c.bleuDoux },
  conseilTitre: { fontSize: 16, fontWeight: "600", color: c.bleuEncre },
  conseilTexte: { fontSize: 15, lineHeight: 22, color: c.encre },
  actions: { gap: 10, marginTop: 8 },
}));
