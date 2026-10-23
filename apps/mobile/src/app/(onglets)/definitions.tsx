import {
  ESPACES,
  TYPOGRAPHIE,
  useMiseEnPage,
  creerStyles,
  TOUCHE_MIN,
  useTheme,
} from "../../theme";
import { EntetePage } from "../../components/entete";
import { CarteAcademique } from "../../components/carte-academique";
import { LangueAppuiSchema, NiveauSchema, type LangueAppui } from "@camille/shared";
import Constants from "expo-constants";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ADRESSE_API } from "../../api";
import { Bouton } from "../../components/bouton";
import { CaseACocher, Puces, Segments, type OptionChoix } from "../../components/choix";
import { Ecran } from "../../components/ecran";
import { IconeHautParleur } from "../../components/icones";
import { Section } from "../../components/section";
import { useDonnees } from "../../donnees/donnees-context";
import { DEBITS, ModeMicroSchema, ThemeSchema, VitesseVoixSchema } from "../../donnees/preferences";
import { NOMS_LANGUES, useI18n } from "../../i18n";
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
  const miseEnPage = useMiseEnPage();
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
      <ScrollView contentContainerStyle={miseEnPage.contenu}>
        <EntetePage titre={t.definitions.titre} />

        <Section titre={t.definitions.langues}>
          <CarteAcademique style={styles.grupo}>
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
          </CarteAcademique>
        </Section>

        <Section titre={t.definitions.objetivoEstudo}>
          <CarteAcademique style={styles.grupo}>
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
          </CarteAcademique>
        </Section>

        <Section titre={t.definitions.vozMicro}>
          <CarteAcademique style={styles.grupo}>
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
            <CaseACocher
              coche={preferences.retoursMicro}
              libelle={t.definitions.retours}
              aide={t.definitions.retoursAide}
              onChange={(retoursMicro) => modifierPreferences({ retoursMicro })}
            />
          </CarteAcademique>
        </Section>

        <Section titre={t.definitions.aparenciaAcessibilidade}>
          <CarteAcademique style={styles.grupo}>
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
          </CarteAcademique>
        </Section>

        <Section titre={t.definitions.dadosLocais}>
          <CarteAcademique style={styles.grupo}>
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
          </CarteAcademique>
        </Section>

        <Section titre={t.definitions.sobreAplicacao}>
          <CarteAcademique style={styles.grupo}>
            <Text style={styles.texte}>{t.definitions.aproposTexte}</Text>
            <Text style={styles.discret}>
              {`${t.definitions.serveur(ADRESSE_API)} · v${Constants.expoConfig?.version ?? "?"}`}
            </Text>
          </CarteAcademique>
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
  grupo: { gap: ESPACES.xl },
  remplir: { flex: 1 },
  reglage: { gap: 10 },
  reglageLibelle: { fontSize: 16, fontWeight: "600", color: c.encre },
  aide: { ...TYPOGRAPHIE.description, color: c.encre2 },
  texte: { fontSize: 15, lineHeight: 22, color: c.encre2 },
  discret: { fontSize: 13, color: c.encre3 },
  lien: {
    minHeight: TOUCHE_MIN,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: ESPACES.sm,
    paddingHorizontal: ESPACES.xs,
  },
  lienTexte: { fontSize: 15, fontWeight: "600", color: c.bleu },
  confirmation: { gap: ESPACES.md },
  question: { fontSize: 16, fontWeight: "600", color: c.encre },
  boutons: { flexDirection: "row", gap: 10 },
}));
