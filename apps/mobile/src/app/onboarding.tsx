import { LangueAppuiSchema, NiveauSchema, type LangueAppui } from "@camille/shared";
import { requestRecordingPermissionsAsync } from "expo-audio";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Bouton } from "../components/bouton";
import { CaseACocher, Puces, type OptionChoix } from "../components/choix";
import { Ecran } from "../components/ecran";
import { IconeRetour } from "../components/icones";
import { OrbeCamille } from "../components/orbe-camille";
import { Progression } from "../components/progression";
import { Text } from "../components/texte";
import { useDonnees } from "../donnees/donnees-context";
import { NOMS_LANGUES, useI18n } from "../i18n";
import { COLONNE_LECTURE, TOUCHE_MIN, creerStyles, serif, useTheme } from "../theme";

const ETAPES = 3;
type Etape = 1 | 2 | 3;

const LANGUES: OptionChoix<LangueAppui>[] = LangueAppuiSchema.options.map((langue) => ({
  valeur: langue,
  libelle: NOMS_LANGUES[langue],
}));

/**
 * Primeira utilização: línguas, nível alvo e microfone. Cada escolha fica logo nas
 * preferências (a interface muda de língua no próprio ecrã); no fim, `onboardingFait`
 * passa a true e o Stack.Protected do layout raiz troca para o resto da app.
 */
export default function Onboarding() {
  const styles = useStyles();
  const { couleurs } = useTheme();
  const { t, rtl } = useI18n();
  const { preferences, modifierPreferences } = useDonnees();
  const [etape, setEtape] = useState<Etape>(1);
  const [memeLangue, setMemeLangue] = useState(
    preferences.langueAppui === preferences.langueInterface,
  );
  const [microRefuse, setMicroRefuse] = useState(false);

  const terminer = () => modifierPreferences({ onboardingFait: true });

  const demanderMicro = async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (granted) {
      terminer();
    } else {
      setMicroRefuse(true);
    }
  };

  const choisirMemeLangue = (meme: boolean) => {
    setMemeLangue(meme);
    if (meme) modifierPreferences({ langueAppui: preferences.langueInterface });
  };

  const o = t.onboarding;

  return (
    <Ecran>
      <View style={styles.entete}>
        {etape > 1 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.communs.retour}
            onPress={() => setEtape((e) => (e - 1) as Etape)}
            style={styles.retour}
          >
            <IconeRetour couleur={couleurs.encre} miroir={rtl} />
          </Pressable>
        ) : (
          <View style={styles.marque}>
            <View style={styles.pastille}>
              <Text style={styles.pastilleTexte}>C</Text>
            </View>
            <Text style={styles.marqueTexte}>Camille</Text>
          </View>
        )}
        <Text style={styles.etape}>{o.etape(etape, ETAPES)}</Text>
      </View>
      <View style={styles.progression}>
        <Progression actuel={etape} total={ETAPES} libelle={o.etape(etape, ETAPES)} />
      </View>

      <ScrollView contentContainerStyle={styles.contenu}>
        {etape === 1 && (
          <>
            <Text accessibilityRole="header" style={styles.titre}>
              {o.langues.titre}
            </Text>
            <Text style={styles.texte}>{o.langues.texte}</Text>
            <View style={styles.bloc}>
              <Text style={styles.libelle}>{o.langues.interface}</Text>
              <Puces
                options={LANGUES}
                valeur={preferences.langueInterface}
                onChange={(langueInterface) =>
                  modifierPreferences(
                    memeLangue
                      ? { langueInterface, langueAppui: langueInterface }
                      : { langueInterface },
                  )
                }
              />
            </View>
            <View style={styles.bloc}>
              <Text style={styles.libelle}>{o.langues.appui}</Text>
              <CaseACocher
                coche={memeLangue}
                libelle={o.langues.memeLangue}
                onChange={choisirMemeLangue}
              />
              {!memeLangue && (
                <Puces
                  options={LANGUES}
                  valeur={preferences.langueAppui}
                  onChange={(langueAppui) => modifierPreferences({ langueAppui })}
                />
              )}
              <Text style={styles.aide}>{o.langues.changer}</Text>
            </View>
          </>
        )}

        {etape === 2 && (
          <>
            <Text accessibilityRole="header" style={styles.titre}>
              {o.niveau.titre}
            </Text>
            <Text style={styles.texte}>{o.niveau.texte}</Text>
            <View accessibilityRole="radiogroup" style={styles.bloc}>
              {NiveauSchema.options.map((niveau) => {
                const choisi = preferences.niveau === niveau;
                return (
                  <Pressable
                    key={niveau}
                    accessibilityRole="radio"
                    aria-checked={choisi}
                    accessibilityLabel={`${niveau}, ${t.niveaux[niveau]}`}
                    onPress={() => modifierPreferences({ niveau })}
                    style={[styles.carte, choisi && styles.carteChoisie]}
                  >
                    <Text style={[styles.carteCode, choisi && styles.carteCodeChoisi]}>
                      {niveau}
                    </Text>
                    <View style={styles.carteCorps}>
                      <Text style={styles.carteNom}>{t.niveaux[niveau]}</Text>
                      <Text style={styles.carteUsage}>{o.niveau.usages[niveau]}</Text>
                      <Text style={styles.carteExemple}>{o.niveau.exemples[niveau]}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.aide}>{o.niveau.conseil}</Text>
          </>
        )}

        {etape === 3 && (
          <>
            <View style={styles.orbe}>
              <OrbeCamille etat="ecoute" niveau={0.4} taille={120} />
            </View>
            <Text accessibilityRole="header" style={styles.titre}>
              {o.micro.titre}
            </Text>
            <Text style={styles.texte}>{o.micro.texte}</Text>
            <View style={styles.bloc}>
              {o.micro.points.map((point, i) => (
                <View key={i} style={styles.point}>
                  <View style={styles.puce} />
                  <Text style={styles.pointTexte}>{point}</Text>
                </View>
              ))}
            </View>
            {microRefuse && (
              <View accessibilityRole="alert" style={styles.avis}>
                <Text style={styles.avisTexte}>{o.micro.refuse}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.pied}>
        {etape < 3 ? (
          <Bouton libelle={o.continuer} onPress={() => setEtape((e) => (e + 1) as Etape)} />
        ) : microRefuse ? (
          <Bouton libelle={o.continuer} onPress={terminer} />
        ) : (
          <>
            <Bouton libelle={o.micro.permettre} onPress={() => void demanderMicro()} />
            <Bouton libelle={o.micro.plusTard} variante="secondaire" onPress={terminer} />
          </>
        )}
      </View>
    </Ecran>
  );
}

const useStyles = creerStyles((c) => ({
  entete: {
    ...COLONNE_LECTURE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    minHeight: TOUCHE_MIN + 18,
  },
  retour: {
    width: TOUCHE_MIN,
    height: TOUCHE_MIN,
    marginStart: -12,
    borderRadius: TOUCHE_MIN / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  marque: { flexDirection: "row", alignItems: "center", gap: 10 },
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
  etape: { fontSize: 14, fontWeight: "600", color: c.encre2 },
  progression: { ...COLONNE_LECTURE, paddingHorizontal: 20 },
  contenu: { ...COLONNE_LECTURE, padding: 20, paddingTop: 24, gap: 16 },
  titre: { fontSize: 26, lineHeight: 32, fontWeight: "600", color: c.encre },
  texte: { fontSize: 16, lineHeight: 23, color: c.encre2 },
  bloc: { gap: 10, marginTop: 8 },
  libelle: { fontSize: 14, fontWeight: "600", color: c.encre },
  aide: { fontSize: 14, lineHeight: 20, color: c.encre2 },
  carte: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: c.ligne,
    backgroundColor: c.surface,
  },
  carteChoisie: { borderColor: c.bleu, backgroundColor: c.bleuDoux },
  carteCode: { fontSize: 26, fontWeight: "700", color: c.encre2, minWidth: 44 },
  carteCodeChoisi: { color: c.bleu },
  carteCorps: { flex: 1, gap: 3 },
  carteNom: { fontSize: 17, fontWeight: "600", color: c.encre },
  carteUsage: { fontSize: 14, fontWeight: "600", color: c.bleuEncre },
  carteExemple: { fontSize: 14, lineHeight: 20, color: c.encre2 },
  orbe: { alignItems: "center", paddingVertical: 8 },
  point: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  puce: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.bleu, marginTop: 7 },
  pointTexte: { flex: 1, fontSize: 15, lineHeight: 22, color: c.encre },
  avis: { padding: 14, borderRadius: 14, backgroundColor: c.ecouteDoux },
  avisTexte: { fontSize: 14, lineHeight: 20, color: c.ecouteEncre },
  pied: {
    ...COLONNE_LECTURE,
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
}));
