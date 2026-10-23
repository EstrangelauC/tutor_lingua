import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
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
import { ESPACES, useMiseEnPage, useTheme } from "../../theme";

export default function Percurso() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { couleurs } = useTheme();
  const { contenu } = useMiseEnPage();
  const { historique, preferences } = useDonnees();
  const recomendada = recomendarPratica(historique, preferences.niveau);
  // O histórico é guardado por data decrescente; a entrada 0 é a mais recente.
  const ultimaSessao = historique[0];

  return (
    <Ecran bords={["top"]}>
      <ScrollView contentContainerStyle={contenu}>
        <EntetePage titre={t.onglets.percurso} description={t.accueil.francais} />
        <CarteAcademique accent>
          <View style={{ gap: ESPACES.md }}>
            <Text variante="libelle" style={{ color: couleurs.encre2 }}>
              {t.accueil.objectif(preferences.niveau)} · TCF IRN
            </Text>
            <BadgeNiveau niveau={preferences.niveau} />
          </View>
        </CarteAcademique>
        <View style={{ gap: ESPACES.md }}>
          <EnteteSection titre={t.accueil.continuer} />
          <CarteAcademique>
            <View style={{ gap: ESPACES.md }}>
              <Text variante="section">{TACHES[recomendada].titre}</Text>
              <Text variante="description">{t.taches[recomendada].description}</Text>
              <Bouton
                libelle={t.accueil.commencer}
                onPress={() =>
                  router.push({ pathname: "/session", params: { tache: recomendada } })
                }
              />
            </View>
          </CarteAcademique>
        </View>
        {ultimaSessao && (
          <View style={{ gap: ESPACES.md }}>
            <EnteteSection titre={t.historique.titre} />
            <CarteAcademique>
              <View style={{ gap: ESPACES.md }}>
                <Text variante="section">{TACHES[ultimaSessao.tache].titre}</Text>
                <Text variante="meta">
                  {new Date(ultimaSessao.date).toLocaleDateString(locale)}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: ESPACES.sm }}>
                  <Text variante="description">{t.historique.ultimoNivel}</Text>
                  <BadgeNiveau niveau={ultimaSessao.feedback.niveauEstime} />
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
          </View>
        )}
        <View style={{ gap: ESPACES.md }}>
          <EnteteSection titre={t.accueil.choisir} />
          {Object.entries(TACHES).map(([id, tache]) => (
            <CarteAcademique key={id}>
              <View style={{ gap: ESPACES.xs }}>
                <Text variante="section">{tache.titre}</Text>
                <Text variante="description">
                  {t.taches[id as keyof typeof TACHES].description}
                </Text>
              </View>
            </CarteAcademique>
          ))}
        </View>
      </ScrollView>
    </Ecran>
  );
}
