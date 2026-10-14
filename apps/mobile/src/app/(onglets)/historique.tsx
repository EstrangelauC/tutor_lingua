import { TacheSchema, type Tache } from "@camille/shared";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Bouton } from "../../components/bouton";
import { Puces, type OptionChoix } from "../../components/choix";
import { Ecran } from "../../components/ecran";
import { GraphiqueNiveaux } from "../../components/graphique-niveaux";
import { IconeSuivant } from "../../components/icones";
import { OrbeCamille } from "../../components/orbe-camille";
import { useDonnees } from "../../donnees/donnees-context";
import { enMinutes, statistiques } from "../../donnees/historique";
import { jourEtMois, useI18n } from "../../i18n";
import { ECHELLE, TACHES } from "../../taches";
import { creerStyles, serif, useTheme } from "../../theme";
import { Text } from "../../components/texte";

type Filtre = Tache | "toutes";

export default function Historique() {
  const router = useRouter();
  const styles = useStyles();
  const { couleurs } = useTheme();
  const { t, rtl, locale } = useI18n();
  const { historique, preferences } = useDonnees();
  const [filtre, setFiltre] = useState<Filtre>("toutes");

  const entete = (
    <View style={styles.entete}>
      <Text accessibilityRole="header" style={styles.titre}>
        {t.historique.titre}
      </Text>
      <Text style={styles.sousTitre}>{t.historique.sousTitre}</Text>
    </View>
  );

  if (historique.length === 0) {
    return (
      <Ecran bords={["top"]}>
        <ScrollView contentContainerStyle={styles.contenu}>
          {entete}
          <View style={[styles.carte, styles.videCarte]}>
            <OrbeCamille etat="attend" taille={72} />
            <Text style={styles.videTitre}>{t.historique.vide.titre}</Text>
            <Text style={styles.videTexte}>{t.historique.vide.texte}</Text>
          </View>
          <View style={styles.carte}>
            <GraphiqueNiveaux
              niveaux={[]}
              cible={preferences.niveau}
              vide={t.historique.vide.graphique}
            />
          </View>
          <Bouton libelle={t.historique.vide.commencer} onPress={() => router.navigate("/")} />
        </ScrollView>
      </Ecran>
    );
  }

  const stats = statistiques(historique);
  const liste = filtre === "toutes" ? historique : historique.filter((e) => e.tache === filtre);
  const filtres: OptionChoix<Filtre>[] = [
    { valeur: "toutes", libelle: t.historique.toutes },
    ...TacheSchema.options.map((tache) => ({ valeur: tache, libelle: TACHES[tache].titre })),
  ];
  const rangCible = ECHELLE.indexOf(preferences.niveau);

  return (
    <Ecran bords={["top"]}>
      <ScrollView contentContainerStyle={styles.contenu}>
        {entete}

        <View style={styles.chiffres}>
          {[
            [t.historique.sessions, String(stats.sessions)],
            [t.historique.temps, t.duree(stats.minutes)],
            [t.historique.objectif, preferences.niveau],
          ].map(([libelle, valeur]) => (
            <View key={libelle} style={[styles.carte, styles.chiffre]}>
              <Text style={styles.chiffreLibelle}>{libelle}</Text>
              <Text style={styles.chiffreValeur}>{valeur}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.carte, styles.evolution]}>
          <View style={styles.evolutionTete}>
            <Text accessibilityRole="header" style={styles.carteTitre}>
              {t.historique.evolution}
            </Text>
            <Text style={styles.carteSous}>
              {t.historique.dernieres(stats.evolution.length, stats.evolution.at(-1) ?? "")}
            </Text>
          </View>
          <GraphiqueNiveaux niveaux={stats.evolution} cible={preferences.niveau} />
          <View style={styles.legende}>
            <View style={styles.legendeTrait} />
            <Text style={styles.legendeTexte}>
              {`${t.feedback.objectif} ${preferences.niveau}`}
            </Text>
          </View>
        </View>

        <Puces options={filtres} valeur={filtre} onChange={setFiltre} />

        <View style={styles.liste}>
          {liste.length === 0 && <Text style={styles.aucune}>{t.historique.aucunePourTache}</Text>}
          {liste.map((entree) => {
            const { jour, mois } = jourEtMois(entree.date, locale);
            const niveau = entree.feedback.niveauEstime;
            const atteint = ECHELLE.indexOf(niveau) >= rangCible;
            return (
              <Pressable
                key={entree.id}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: "/feedback", params: { id: entree.id } })}
                style={({ pressed }) => [styles.ligne, pressed && styles.lignePressee]}
              >
                <View style={styles.date}>
                  <Text style={styles.jour}>{jour}</Text>
                  <Text style={styles.mois}>{mois}</Text>
                </View>
                <View style={styles.ligneCorps}>
                  <Text style={styles.ligneTache}>{TACHES[entree.tache].titre}</Text>
                  <Text style={styles.ligneDetail}>
                    {t.historique.ligne(enMinutes(entree.dureeMs), entree.echanges)}
                  </Text>
                </View>
                <Text style={[styles.badge, atteint && styles.badgeAtteint]}>{niveau}</Text>
                <IconeSuivant couleur={couleurs.encre3} taille={20} miroir={rtl} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Ecran>
  );
}

const useStyles = creerStyles((c) => ({
  contenu: { padding: 20, gap: 16 },
  entete: { gap: 4, marginBottom: 4 },
  titre: { fontSize: 26, fontWeight: "600", color: c.encre },
  sousTitre: { fontSize: 15, color: c.encre2 },
  carte: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.ligne,
    backgroundColor: c.surface,
  },
  chiffres: { flexDirection: "row", gap: 8 },
  chiffre: { flex: 1, gap: 4, paddingHorizontal: 12 },
  chiffreLibelle: { fontSize: 12, fontWeight: "600", color: c.encre2 },
  chiffreValeur: { fontSize: 22, fontWeight: "700", color: c.encre },
  evolution: { gap: 12 },
  evolutionTete: { gap: 2 },
  carteTitre: { fontSize: 16, fontWeight: "600", color: c.encre },
  carteSous: { fontSize: 13, color: c.encre2 },
  legende: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendeTrait: {
    width: 22,
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: c.bleuTrait,
  },
  legendeTexte: { fontSize: 12, color: c.encre2 },
  liste: { gap: 8 },
  aucune: { fontSize: 14, color: c.encre2, paddingVertical: 8 },
  ligne: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.ligne,
    backgroundColor: c.surface,
  },
  lignePressee: { backgroundColor: c.bleuDoux },
  date: { width: 40, alignItems: "center" },
  jour: { fontSize: 18, fontWeight: "700", color: c.encre },
  mois: { fontSize: 12, color: c.encre2 },
  ligneCorps: { flex: 1, gap: 2 },
  ligneTache: { fontFamily: serif, fontSize: 17, color: c.encre },
  ligneDetail: { fontSize: 13, color: c.encre2 },
  badge: {
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: c.encre2,
    backgroundColor: c.discret,
  },
  badgeAtteint: { color: c.bleuEncre, backgroundColor: c.bleuDoux },
  videCarte: { alignItems: "center", gap: 10, paddingVertical: 24 },
  videTitre: { fontSize: 18, fontWeight: "600", color: c.encre, textAlign: "center" },
  videTexte: { fontSize: 15, lineHeight: 22, color: c.encre2, textAlign: "center" },
}));
