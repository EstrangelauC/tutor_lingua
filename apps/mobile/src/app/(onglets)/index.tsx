import { TacheSchema, type Tache } from "@camille/shared";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Bouton } from "../../components/bouton";
import { Ecran } from "../../components/ecran";
import { IconeSuivant } from "../../components/icones";
import { Section } from "../../components/section";
import { useDonnees } from "../../donnees/donnees-context";
import { derniereParTache, joursDepuis } from "../../donnees/historique";
import { useI18n } from "../../i18n";
import { TACHES } from "../../taches";
import { COLONNE_LECTURE, creerStyles, serif, TOUCHE_MIN, useTheme } from "../../theme";
import { Text } from "../../components/texte";

export default function Accueil() {
  const router = useRouter();
  const styles = useStyles();
  const { couleurs } = useTheme();
  const { t, rtl } = useI18n();
  const { preferences, historique } = useDonnees();
  const [maintenant] = useState(() => new Date());

  const derniere = historique[0];
  const parTache = derniereParTache(historique);
  const commencer = (tache: Tache) => router.push({ pathname: "/session", params: { tache } });

  return (
    <Ecran bords={["top"]}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.marque}>
          <View style={styles.pastille}>
            <Text style={styles.pastilleTexte}>C</Text>
          </View>
          <Text style={styles.marqueTexte}>Camille</Text>
          <Text style={styles.marqueSous}>{t.marqueSous}</Text>
        </View>

        <View style={styles.entete}>
          <View style={styles.remplir}>
            <Text style={styles.salut}>
              {derniere ? t.accueil.bonjourRetour : t.accueil.bonjour}
            </Text>
            <Text accessibilityRole="header" style={styles.titre}>
              {t.accueil.titre}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityHint={t.accueil.objectifAide}
            onPress={() => router.navigate("/definitions")}
            style={styles.objectif}
          >
            <Text style={styles.objectifTexte}>{t.accueil.objectif(preferences.niveau)}</Text>
          </Pressable>
        </View>

        {derniere && (
          <View style={styles.continuer}>
            <Text style={styles.continuerEtiquette}>{t.accueil.continuer}</Text>
            <Text style={styles.continuerTitre}>{TACHES[derniere.tache].titre}</Text>
            <Text style={styles.continuerTexte}>
              {`${t.taches[derniere.tache].resume} · ${t.accueil.derniereFois(
                derniere.feedback.niveauEstime,
                t.quand(joursDepuis(derniere.date, maintenant)),
              )}`}
            </Text>
            <Bouton
              libelle={t.accueil.reprendre}
              onPress={() => commencer(derniere.tache)}
              style={styles.reprendre}
            />
          </View>
        )}

        <Section titre={t.accueil.choisir}>
          <View style={styles.pile}>
            {TacheSchema.options.map((tache) => {
              const { titre, numero } = TACHES[tache];
              const niveau = parTache[tache]?.feedback.niveauEstime;
              return (
                <Pressable
                  key={tache}
                  accessibilityRole="button"
                  accessibilityHint={t.accueil.commencerAide}
                  onPress={() => commencer(tache)}
                  style={({ pressed }) => [styles.carte, pressed && styles.cartePressee]}
                >
                  <View style={styles.carteCorps}>
                    <View style={styles.carteTete}>
                      <Text style={styles.carteTitre}>{titre}</Text>
                      <Text style={styles.carteNumero}>{`Tâche ${numero}`}</Text>
                    </View>
                    <Text style={styles.carteDescription}>{t.taches[tache].description}</Text>
                    {niveau && (
                      <Text style={styles.carteNiveau}>{t.accueil.dernierNiveau(niveau)}</Text>
                    )}
                  </View>
                  <IconeSuivant couleur={couleurs.encre3} taille={22} miroir={rtl} />
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Text style={styles.aide}>{t.accueil.francais}</Text>
      </ScrollView>
    </Ecran>
  );
}

const useStyles = creerStyles((c) => ({
  contenu: { ...COLONNE_LECTURE, padding: 20, gap: 24 },
  remplir: { flex: 1 },
  marque: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  pastille: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.bleu,
    alignItems: "center",
    justifyContent: "center",
  },
  pastilleTexte: { color: c.surPlein, fontFamily: serif, fontStyle: "italic", fontSize: 18 },
  marqueTexte: { fontFamily: serif, fontStyle: "italic", fontSize: 20, color: c.encre },
  marqueSous: { fontSize: 14, color: c.encre2 },
  entete: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  salut: { fontSize: 16, color: c.encre2 },
  titre: { fontSize: 26, fontWeight: "600", color: c.encre },
  objectif: {
    minHeight: TOUCHE_MIN,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: c.bleuDoux,
    justifyContent: "center",
  },
  objectifTexte: { fontSize: 14, fontWeight: "700", color: c.bleuEncre },
  continuer: {
    padding: 18,
    gap: 6,
    borderRadius: 20,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.ligne,
  },
  continuerEtiquette: { fontSize: 13, fontWeight: "600", color: c.bleu },
  continuerTitre: { fontFamily: serif, fontSize: 22, color: c.encre },
  continuerTexte: { fontSize: 14, lineHeight: 20, color: c.encre2 },
  reprendre: { marginTop: 8 },
  pile: { gap: 10 },
  carte: {
    minHeight: 84,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.ligne,
    backgroundColor: c.surface,
  },
  cartePressee: { backgroundColor: c.bleuDoux, borderColor: c.bleuTrait },
  carteCorps: { flex: 1, gap: 4 },
  carteTete: { flexDirection: "row", alignItems: "baseline", gap: 8, flexWrap: "wrap" },
  carteTitre: { fontFamily: serif, fontSize: 19, color: c.encre },
  carteNumero: { fontFamily: serif, fontSize: 13, color: c.encre3 },
  carteDescription: { fontSize: 14, lineHeight: 20, color: c.encre2 },
  carteNiveau: { fontSize: 13, fontWeight: "600", color: c.bleuEncre },
  aide: { fontSize: 14, lineHeight: 20, color: c.encre2 },
}));
