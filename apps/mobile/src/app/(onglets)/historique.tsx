import { ESPACES, TYPOGRAPHIE, RAYONS, useMiseEnPage, creerStyles, useTheme } from "../../theme";
import { EntetePage, EnteteSection } from "../../components/entete";
import { EtatVide } from "../../components/etat-vide";
import { BadgeNiveau } from "../../components/badge-niveau";
import { CarteAcademique } from "../../components/carte-academique";
import { TacheSchema, type Tache } from "@camille/shared";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Bouton } from "../../components/bouton";
import { Puces, type OptionChoix } from "../../components/choix";
import { Ecran } from "../../components/ecran";
import { GraphiqueNiveaux } from "../../components/graphique-niveaux";
import { IconeSuivant } from "../../components/icones";
import { useDonnees } from "../../donnees/donnees-context";
import { enMinutes, filtrarHistorico, statistiques } from "../../donnees/historique";
import { FRANCAIS, dateCourte, jourEtMois, useI18n } from "../../i18n";
import { ECHELLE, TACHES } from "../../taches";
import { Text } from "../../components/texte";

type Filtre = Tache | "toutes";

export default function Historique() {
  const router = useRouter();
  const styles = useStyles();
  const miseEnPage = useMiseEnPage();
  const { couleurs } = useTheme();
  const { t, rtl, locale } = useI18n();
  const { historique, preferences } = useDonnees();
  const [filtre, setFiltre] = useState<Filtre>("toutes");

  const entete = <EntetePage titre={t.historique.titre} description={t.historique.sousTitre} />;

  if (historique.length === 0) {
    return (
      <Ecran bords={["top"]}>
        <ScrollView contentContainerStyle={miseEnPage.contenu}>
          {entete}
          <EnteteSection titre={t.historique.visaoGeral} />
          <View style={styles.chiffres}>
            <CarteAcademique style={styles.chiffre}>
              <Text style={styles.chiffreLibelle}>{t.historique.sessions}</Text>
              <Text style={styles.chiffreValeur}>0</Text>
            </CarteAcademique>
            <CarteAcademique style={styles.chiffre}>
              <Text style={styles.chiffreLibelle}>{t.historique.temps}</Text>
              <Text style={styles.chiffreValeur}>{t.duree(0)}</Text>
            </CarteAcademique>
          </View>
          <EnteteSection titre={t.historique.evolution} />
          <CarteAcademique>
            <GraphiqueNiveaux
              niveaux={[]}
              cible={preferences.niveau}
              vide={t.historique.vide.graphique}
            />
            <Text
              style={styles.legendeTexte}
            >{`${t.feedback.objectif} ${preferences.niveau}`}</Text>
          </CarteAcademique>
          <EnteteSection titre={t.historique.titre} />
          <CarteAcademique>
            <EtatVide titre={t.historique.vide.titre} description={t.historique.vide.texte} />
          </CarteAcademique>
          <Bouton
            libelle={t.historique.vide.commencer}
            onPress={() => router.navigate("/pratique" as Href)}
            style={miseEnPage.format === "desktop" ? { alignSelf: "flex-start" } : undefined}
          />
        </ScrollView>
      </Ecran>
    );
  }

  const stats = statistiques(historique);
  const liste = filtrarHistorico(historique, filtre);
  const filtres: OptionChoix<Filtre>[] = [
    { valeur: "toutes", libelle: t.historique.toutes },
    ...TacheSchema.options.map((tache) => ({ valeur: tache, libelle: TACHES[tache].titre })),
  ];
  const rangCible = ECHELLE.indexOf(preferences.niveau);

  return (
    <Ecran bords={["top"]}>
      <ScrollView contentContainerStyle={miseEnPage.contenu}>
        {entete}
        <EnteteSection titre={t.historique.visaoGeral} />

        <View style={styles.chiffres}>
          {[
            [t.historique.sessions, String(stats.sessions)],
            [t.historique.temps, t.duree(stats.minutes)],
            [t.historique.ultimoNivel, historique[0]?.feedback.niveauEstime ?? "—"],
          ].map(([libelle, valeur]) => (
            <CarteAcademique key={libelle} style={[styles.chiffre]}>
              <Text style={styles.chiffreLibelle}>{libelle}</Text>
              <Text style={styles.chiffreValeur}>{valeur}</Text>
            </CarteAcademique>
          ))}
        </View>

        <CarteAcademique style={[styles.evolution]}>
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
          <Text style={styles.carteSous}>{t.feedback.note}</Text>
        </CarteAcademique>

        <EnteteSection titre={t.historique.titre} />
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
                accessibilityLabel={`${dateCourte(entree.date, locale)}, ${TACHES[entree.tache].titre}, ${t.historique.ligne(enMinutes(entree.dureeMs), entree.echanges)}, ${t.feedback.niveauEstime} ${niveau}`}
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
                  <Text style={styles.ligneDetail}>{dateCourte(entree.date, locale)}</Text>
                </View>
                <BadgeNiveau niveau={niveau} atteint={atteint} />
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
  chiffres: { flexDirection: "row", flexWrap: "wrap", gap: ESPACES.sm },
  chiffre: { flexGrow: 1, flexBasis: 120, gap: ESPACES.xs, paddingHorizontal: ESPACES.md },
  chiffreLibelle: { ...TYPOGRAPHIE.libelle, color: c.encre2 },
  chiffreValeur: { fontSize: 22, fontWeight: "700", color: c.encre },
  evolution: { gap: ESPACES.md },
  evolutionTete: { gap: 2 },
  carteTitre: { fontSize: 16, fontWeight: "600", color: c.encre },
  carteSous: { fontSize: 13, color: c.encre2 },
  legende: { flexDirection: "row", alignItems: "center", gap: ESPACES.sm },
  legendeTrait: {
    width: 22,
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: c.bleuTrait,
  },
  legendeTexte: { fontSize: 12, color: c.encre2 },
  liste: { gap: ESPACES.sm },
  aucune: { fontSize: 14, color: c.encre2, paddingVertical: ESPACES.sm },
  ligne: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: ESPACES.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RAYONS.carte,
    borderWidth: 1,
    borderColor: c.ligne,
    backgroundColor: c.surface,
  },
  lignePressee: { backgroundColor: c.bleuDoux },
  date: { width: 40, alignItems: "center" },
  jour: { fontSize: 18, fontWeight: "700", color: c.encre },
  mois: { fontSize: 12, color: c.encre2 },
  ligneCorps: { flex: 1, gap: 2 },
  ligneTache: { ...FRANCAIS, fontSize: 17, color: c.encre },
  ligneDetail: { fontSize: 13, color: c.encre2 },
}));
