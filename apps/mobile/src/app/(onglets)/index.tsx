import type { Tache } from "@camille/shared";
import { useRouter } from "expo-router";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { BadgeNiveau } from "../../components/badge-niveau";
import { Bouton } from "../../components/bouton";
import { CarteAcademique } from "../../components/carte-academique";
import { Ecran } from "../../components/ecran";
import { EntetePage, EnteteSection } from "../../components/entete";
import { Text } from "../../components/texte";
import { useDonnees } from "../../donnees/donnees-context";
import { useI18n } from "../../i18n";
import { recomendarPratica } from "../../session/recommendation";
import { TACHES } from "../../taches";
import { ESPACES, RAYONS, SEUILS, useMiseEnPage, useTheme } from "../../theme";

const TAREFAS: Tache[] = ["entretien", "interaction", "point_de_vue"];

export default function Percurso() {
  const router = useRouter();
  const { t, locale, rtl } = useI18n();
  const { couleurs: c } = useTheme();
  const { contenu } = useMiseEnPage();
  const desktop = useWindowDimensions().width >= SEUILS.desktop;
  const { historique, preferences } = useDonnees();
  const recomendada = recomendarPratica(historique, preferences.niveau);
  const ultimaSessao = historique[0];
  const iniciar = (tache: Tache) => router.push({ pathname: "/session", params: { tache } });

  return (
    <Ecran bords={["top"]}>
      <ScrollView contentContainerStyle={contenu}>
        <EntetePage titre={t.onglets.percurso} description={t.accueil.francais} />

        <View style={{ flexDirection: desktop ? "row" : "column", gap: ESPACES.lg }}>
          <View
            style={{
              flex: desktop ? 1.7 : undefined,
              minWidth: 0,
              minHeight: desktop ? 236 : 210,
              backgroundColor: c.navFundo,
              borderRadius: RAYONS.carte,
              padding: desktop ? ESPACES.xxl : ESPACES.xl,
              justifyContent: "space-between",
              gap: ESPACES.xl,
            }}
          >
            <View style={{ gap: ESPACES.md }}>
              <Text variante="meta" style={{ color: c.navMeta, fontWeight: "700" }}>
                TCF IRN · {t.accueil.objectif(preferences.niveau)}
              </Text>
              <Text
                variante="page"
                accessibilityRole="header"
                style={{
                  color: c.navTexto,
                  fontSize: desktop ? 38 : 32,
                  lineHeight: desktop ? 46 : 40,
                }}
              >
                {t.accueil.titre}
              </Text>
              <Text variante="description" style={{ color: c.navMeta }}>
                {t.accueil.francais}
              </Text>
            </View>
            <Bouton
              variante="secondaire"
              libelle={t.accueil.commencer}
              onPress={() => iniciar(recomendada)}
              style={{ alignSelf: rtl ? "flex-end" : "flex-start" }}
            />
          </View>

          <CarteAcademique
            style={{
              flex: desktop ? 1 : undefined,
              minWidth: 0,
              justifyContent: "space-between",
              padding: desktop ? ESPACES.xxl : ESPACES.xl,
              gap: ESPACES.xl,
            }}
          >
            <View style={{ gap: ESPACES.sm }}>
              <Text variante="meta" style={{ color: c.bleu, fontWeight: "700" }}>
                TCF IRN
              </Text>
              <Text variante="section">{t.accueil.objectif(preferences.niveau)}</Text>
              <Text variante="description">{t.definitions.niveau}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: ESPACES.md }}>
              <View
                style={{
                  width: 66,
                  height: 66,
                  borderRadius: 33,
                  borderWidth: 3,
                  borderColor: c.bleu,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text variante="section" style={{ color: c.bleu, fontWeight: "800" }}>
                  {preferences.niveau}
                </Text>
              </View>
              <Text variante="description" style={{ flex: 1 }}>
                {t.accueil.objectifAide}
              </Text>
            </View>
          </CarteAcademique>
        </View>

        <View style={{ flexDirection: desktop ? "row" : "column", gap: ESPACES.lg }}>
          <View style={{ flex: 1.7, minWidth: 0, gap: ESPACES.md }}>
            <EnteteSection titre={t.accueil.continuer} />
            <CarteAcademique style={{ flex: 1, padding: ESPACES.xl }}>
              <View style={{ flex: 1, gap: ESPACES.md, justifyContent: "space-between" }}>
                <View style={{ gap: ESPACES.sm }}>
                  <Text variante="meta" style={{ color: c.bleu, fontWeight: "700" }}>
                    {t.accueil.continuer}
                  </Text>
                  <Text variante="section">{TACHES[recomendada].titre}</Text>
                  <Text variante="description">{t.taches[recomendada].description}</Text>
                </View>
                <Bouton
                  libelle={t.accueil.commencer}
                  onPress={() => iniciar(recomendada)}
                  style={{ alignSelf: desktop ? "flex-start" : "stretch" }}
                />
              </View>
            </CarteAcademique>
          </View>

          <View style={{ flex: 1, minWidth: 0, gap: ESPACES.md }}>
            <EnteteSection titre={t.historique.titre} />
            {ultimaSessao ? (
              <CarteAcademique style={{ flex: 1, padding: ESPACES.xl }}>
                <View style={{ flex: 1, gap: ESPACES.md, justifyContent: "space-between" }}>
                  <View style={{ gap: ESPACES.sm }}>
                    <Text variante="section">{TACHES[ultimaSessao.tache].titre}</Text>
                    <Text variante="meta">
                      {new Date(ultimaSessao.date).toLocaleDateString(locale)}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: ESPACES.sm }}>
                      <Text variante="description">{t.historique.ultimoNivel}</Text>
                      <BadgeNiveau niveau={ultimaSessao.feedback.niveauEstime} />
                    </View>
                  </View>
                  <Bouton
                    variante="secondaire"
                    libelle={t.feedback.titre}
                    onPress={() =>
                      router.push({ pathname: "/feedback", params: { id: ultimaSessao.id } })
                    }
                  />
                </View>
              </CarteAcademique>
            ) : (
              <CarteAcademique style={{ flex: 1, padding: ESPACES.xl, gap: ESPACES.md }}>
                <Text variante="section">{t.historique.vide.titre}</Text>
                <Text variante="description">{t.historique.vide.texte}</Text>
              </CarteAcademique>
            )}
          </View>
        </View>

        <View style={{ gap: ESPACES.md }}>
          <EnteteSection titre={t.accueil.choisir} />
          <View style={{ flexDirection: desktop ? "row" : "column", gap: ESPACES.lg }}>
            {TAREFAS.map((id) => (
              <CarteAcademique
                key={id}
                style={{ flex: desktop ? 1 : undefined, minWidth: 0, padding: ESPACES.xl }}
              >
                <View style={{ gap: ESPACES.md }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: RAYONS.controle,
                      backgroundColor: c.bleuDoux,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text variante="section" style={{ color: c.bleuEncre, fontWeight: "800" }}>
                      {TACHES[id].numero}
                    </Text>
                  </View>
                  <Text variante="section">{TACHES[id].titre}</Text>
                  <Text variante="description">{t.taches[id].description}</Text>
                </View>
              </CarteAcademique>
            ))}
          </View>
        </View>
      </ScrollView>
    </Ecran>
  );
}
