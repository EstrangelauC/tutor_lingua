import type { Tache } from "@camille/shared";
import { useRouter } from "expo-router";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { BadgeNiveau } from "../../components/badge-niveau";
import { Bouton } from "../../components/bouton";
import { CarteAcademique } from "../../components/carte-academique";
import { Ecran } from "../../components/ecran";
import { EntetePage } from "../../components/entete";
import { Text } from "../../components/texte";
import { useDonnees } from "../../donnees/donnees-context";
import { derniereParTache } from "../../donnees/historique";
import { useI18n } from "../../i18n";
import { TACHES } from "../../taches";
import { ESPACES, LARGEURS, RAYONS, SEUILS, useMiseEnPage, useTheme } from "../../theme";

const TAREFAS: Tache[] = ["entretien", "interaction", "point_de_vue"];

export default function Pratique() {
  const router = useRouter();
  const { t } = useI18n();
  const { couleurs: c } = useTheme();
  const { contenu } = useMiseEnPage();
  const desktop = useWindowDimensions().width >= SEUILS.desktop;
  const { historique, preferences } = useDonnees();
  const ultimas = derniereParTache(historique);

  return (
    <Ecran bords={["top"]}>
      <ScrollView contentContainerStyle={[contenu, desktop && { maxWidth: LARGEURS.contenu }]}>
        <EntetePage titre={t.onglets.praticar} description={t.accueil.francais} />
        <View style={{ flexDirection: desktop ? "row" : "column", gap: ESPACES.lg }}>
          {TAREFAS.map((tache) => (
            <CarteAcademique
              key={tache}
              style={{
                flex: desktop ? 1 : undefined,
                minWidth: 0,
                minHeight: desktop ? 330 : undefined,
                padding: ESPACES.xl,
              }}
            >
              <View style={{ flex: 1, gap: ESPACES.md }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: RAYONS.controle,
                    backgroundColor: c.bleuDoux,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text variante="section" style={{ color: c.bleuEncre, fontWeight: "800" }}>
                    {TACHES[tache].numero}
                  </Text>
                </View>
                <Text variante="section">{TACHES[tache].titre}</Text>
                <Text variante="description">{t.taches[tache].description}</Text>
                <Text variante="meta">{t.taches[tache].resume}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: ESPACES.sm }}>
                  <Text variante="description">
                    {t.definitions.niveau}: {preferences.niveau}
                  </Text>
                  {ultimas[tache] && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: ESPACES.sm }}>
                      <Text variante="description">{t.historique.ultimoNivel}</Text>
                      <BadgeNiveau niveau={ultimas[tache].feedback.niveauEstime} />
                    </View>
                  )}
                </View>
                <Bouton
                  libelle={t.accueil.commencer}
                  onPress={() => router.push({ pathname: "/session", params: { tache } })}
                  style={desktop && { marginTop: "auto" }}
                />
              </View>
            </CarteAcademique>
          ))}
        </View>
      </ScrollView>
    </Ecran>
  );
}
