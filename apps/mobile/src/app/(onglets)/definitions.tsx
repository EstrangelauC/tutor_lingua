import { LangueAppuiSchema, NiveauSchema, type LangueAppui } from "@camille/shared";
import Constants from "expo-constants";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ADRESSE_API } from "../../api";
import { Bouton } from "../../components/bouton";
import { Puces, Segments, type OptionChoix } from "../../components/choix";
import { Ecran } from "../../components/ecran";
import { IconeHautParleur } from "../../components/icones";
import { Section } from "../../components/section";
import { useDonnees } from "../../donnees/donnees-context";
import { DEBITS, ModeMicroSchema, ThemeSchema, VitesseVoixSchema } from "../../donnees/preferences";
import { NOMS_LANGUES, useI18n } from "../../i18n";
import { COLONNE_LECTURE, creerStyles, TOUCHE_MIN, useTheme } from "../../theme";
import { arreterDeParler, parler } from "../../voix/parole";
import { Text } from "../../components/texte";

/** Lido pela Camille no botão «Ouvir exemplo», para comparar as velocidades. */
const EXEMPLE = "Bonjour ! Je m'appelle Camille. Aujourd'hui, on va parler un peu de vous.";

const LANGUES: OptionChoix<LangueAppui>[] = LangueAppuiSchema.options.map((langue) => ({
  valeur: langue,
  libelle: NOMS_LANGUES[langue],
}));

export default function Definitions() {
  const styles = useStyles();
  const { couleurs } = useTheme();
  const { t } = useI18n();
  const { preferences, modifierPreferences, historique, effacerHistorique } = useDonnees();
  const [confirmation, setConfirmation] = useState(false);
  const [efface, setEfface] = useState(false);

  useEffect(() => () => arreterDeParler(), []);

  const ecouterExemple = () => {
    arreterDeParler();
    void parler(EXEMPLE, DEBITS[preferences.vitesseVoix]);
  };

  return (
    <Ecran bords={["top"]}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text accessibilityRole="header" style={styles.titre}>
          {t.definitions.titre}
        </Text>

        <Section titre={t.definitions.langues}>
          <View style={styles.carte}>
            <Reglage libelle={t.definitions.interface}>
              <Puces
                options={LANGUES}
                valeur={preferences.langueInterface}
                onChange={(langueInterface) => modifierPreferences({ langueInterface })}
              />
            </Reglage>
            <Reglage libelle={t.definitions.appui} aide={t.definitions.appuiAide}>
              <Puces
                options={LANGUES}
                valeur={preferences.langueAppui}
                onChange={(langueAppui) => modifierPreferences({ langueAppui })}
              />
            </Reglage>
          </View>
        </Section>

        <Section titre={t.definitions.pratique}>
          <View style={styles.carte}>
            <Reglage libelle={t.definitions.niveau} aide={t.niveaux[preferences.niveau]}>
              <Segments
                options={NiveauSchema.options.map((niveau) => ({
                  valeur: niveau,
                  libelle: niveau,
                  accessibilityLabel: `${niveau}, ${t.niveaux[niveau]}`,
                }))}
                valeur={preferences.niveau}
                onChange={(niveau) => modifierPreferences({ niveau })}
              />
            </Reglage>
            <Reglage libelle={t.definitions.vitesse}>
              <Segments
                options={VitesseVoixSchema.options.map((vitesse) => ({
                  valeur: vitesse,
                  libelle: t.definitions.vitesses[vitesse],
                }))}
                valeur={preferences.vitesseVoix}
                onChange={(vitesseVoix) => modifierPreferences({ vitesseVoix })}
              />
              <Pressable accessibilityRole="button" onPress={ecouterExemple} style={styles.lien}>
                <IconeHautParleur couleur={couleurs.bleu} taille={20} />
                <Text style={styles.lienTexte}>{t.definitions.ecouterExemple}</Text>
              </Pressable>
            </Reglage>
            <Reglage
              libelle={t.definitions.micro}
              aide={t.definitions.microAide[preferences.modeMicro]}
            >
              <Segments
                options={ModeMicroSchema.options.map((mode) => ({
                  valeur: mode,
                  libelle: t.session.modes[mode],
                }))}
                valeur={preferences.modeMicro}
                onChange={(modeMicro) => modifierPreferences({ modeMicro })}
              />
            </Reglage>
          </View>
        </Section>

        <Section titre={t.definitions.apparence}>
          <View style={styles.carte}>
            <Reglage libelle={t.definitions.theme}>
              <Segments
                options={ThemeSchema.options.map((theme) => ({
                  valeur: theme,
                  libelle: t.definitions.themes[theme],
                }))}
                valeur={preferences.theme}
                onChange={(theme) => modifierPreferences({ theme })}
              />
            </Reglage>
          </View>
        </Section>

        <Section titre={t.definitions.donnees}>
          <View style={styles.carte}>
            <Text style={styles.texte}>{t.definitions.donneesTexte}</Text>
            {confirmation ? (
              <View style={styles.confirmation}>
                <Text style={styles.question}>
                  {t.definitions.effacerQuestion(historique.length)}
                </Text>
                <View style={styles.boutons}>
                  <Bouton
                    libelle={t.communs.annuler}
                    variante="secondaire"
                    onPress={() => setConfirmation(false)}
                    style={styles.remplir}
                  />
                  <Bouton
                    libelle={t.definitions.effacerConfirmer}
                    variante="danger"
                    onPress={() => {
                      effacerHistorique();
                      setConfirmation(false);
                      setEfface(true);
                    }}
                    style={styles.remplir}
                  />
                </View>
              </View>
            ) : (
              <Bouton
                libelle={t.definitions.effacer}
                variante="secondaire"
                desactive={historique.length === 0}
                onPress={() => {
                  setEfface(false);
                  setConfirmation(true);
                }}
              />
            )}
            {efface && (
              <Text accessibilityLiveRegion="polite" style={styles.texte}>
                {t.definitions.efface}
              </Text>
            )}
          </View>
        </Section>

        <Section titre={t.definitions.apropos}>
          <View style={styles.carte}>
            <Text style={styles.texte}>{t.definitions.aproposTexte}</Text>
            <Text style={styles.discret}>
              {`${t.definitions.serveur(ADRESSE_API)} · v${Constants.expoConfig?.version ?? "?"}`}
            </Text>
          </View>
        </Section>
      </ScrollView>
    </Ecran>
  );
}

function Reglage({
  libelle,
  aide,
  children,
}: {
  libelle: string;
  aide?: string;
  children: ReactNode;
}) {
  const styles = useStyles();
  return (
    <View style={styles.reglage}>
      <Text style={styles.reglageLibelle}>{libelle}</Text>
      {children}
      {aide && <Text style={styles.aide}>{aide}</Text>}
    </View>
  );
}

const useStyles = creerStyles((c) => ({
  contenu: { ...COLONNE_LECTURE, padding: 20, gap: 24 },
  titre: { fontSize: 26, fontWeight: "600", color: c.encre },
  remplir: { flex: 1 },
  carte: {
    padding: 16,
    gap: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.ligne,
    backgroundColor: c.surface,
  },
  reglage: { gap: 10 },
  reglageLibelle: { fontSize: 16, fontWeight: "600", color: c.encre },
  aide: { fontSize: 14, lineHeight: 20, color: c.encre2 },
  texte: { fontSize: 15, lineHeight: 22, color: c.encre2 },
  discret: { fontSize: 13, color: c.encre3 },
  lien: {
    minHeight: TOUCHE_MIN,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 4,
  },
  lienTexte: { fontSize: 15, fontWeight: "600", color: c.bleu },
  confirmation: { gap: 12 },
  question: { fontSize: 16, fontWeight: "600", color: c.encre },
  boutons: { flexDirection: "row", gap: 10 },
}));
