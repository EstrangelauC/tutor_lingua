import { TacheSchema, type CreerSessionRequest } from "@camille/shared";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Bouton } from "../components/bouton";
import { BoutonMicro } from "../components/bouton-micro";
import { Segments } from "../components/choix";
import { Ecran } from "../components/ecran";
import { OrbeCamille, type EtatOrbe } from "../components/orbe-camille";
import { Progression } from "../components/progression";
import { Text } from "../components/texte";
import { useDonnees } from "../donnees/donnees-context";
import { DEBITS, ModeMicroSchema, type ModeMicro } from "../donnees/preferences";
import { FRANCAIS, styleTexte, useI18n } from "../i18n";
import { useSessionCamille } from "../session/use-session-camille";
import { TACHES } from "../taches";
import { TOUCHE_MIN, creerStyles, serif, useLarge, useTheme } from "../theme";
import { formulaireAudio } from "../voix/formulaire-audio";
import { arreterDeParler } from "../voix/parole";
import { useEnregistreur } from "../voix/use-enregistreur";

type Saisie = "voix" | "texte";

/** Abaixo disto (dBFS) conta como silêncio. */
const SEUIL_PAROLE_DB = -40;
/** Mãos-livres: envia depois deste silêncio a seguir a ter falado. */
const SILENCE_MS = 1_800;
/** Gravações mais curtas são quase sempre toques acidentais. */
const DUREE_MIN_MS = 600;
const DUREE_MAX_MS = 90_000;

/** Na web, a tecla Espaço não deve fazer de microfone enquanto se escreve. */
function dansUnChamp(cible: EventTarget | null): boolean {
  const element = cible as { tagName?: string; isContentEditable?: boolean } | null;
  return (
    element?.tagName === "INPUT" || element?.tagName === "TEXTAREA" || !!element?.isContentEditable
  );
}

export default function Session() {
  const router = useRouter();
  const styles = useStyles();
  const { couleurs } = useTheme();
  const { t } = useI18n();
  const large = useLarge();
  const { preferences, modifierPreferences, ajouterSession } = useDonnees();
  const params = useLocalSearchParams<{ tache?: string }>();
  const tache = TacheSchema.catch("entretien").parse(params.tache);
  const { niveau, langueAppui, modeMicro } = preferences;
  const config = useMemo<CreerSessionRequest>(
    () => ({ niveau, tache, langueAppui }),
    [niveau, tache, langueAppui],
  );

  const enregistreur = useEnregistreur();
  const [saisie, setSaisie] = useState<Saisie>("voix");
  const [transcriptionVisible, setTranscriptionVisible] = useState(false);
  const [brouillon, setBrouillon] = useState("");
  const defilement = useRef<ScrollView>(null);

  // Lidos dentro de callbacks assíncronos, que podem vir de um render anterior.
  const modeRef = useRef<ModeMicro>(modeMicro);
  const saisieRef = useRef<Saisie>("voix");
  const doigtPose = useRef(false);
  const silence = useRef({ aParle: false, dernierSon: 0 });

  const { etat, demarrer, envoyer, envoyerAudio, rejouer, terminer, interrompre, signalerErreur } =
    useSessionCamille(config, {
      debit: DEBITS[preferences.vitesseVoix],
      onFinParole: (terminee) => {
        if (!terminee && modeRef.current === "mainsLibres" && saisieRef.current === "voix") {
          void commencer();
        }
      },
    });

  // Cria a sessão ao abrir o ecrã; para a leitura ao sair.
  useEffect(() => {
    void demarrer();
    return () => arreterDeParler();
  }, [demarrer]);

  const occupee = etat.activite !== null;
  const microActif = !occupee && etat.sessionId !== null && !etat.terminee;

  const signalerTropCourt = () =>
    signalerErreur(modeRef.current === "maintenir" ? "trop_court_maintenir" : "trop_court");

  async function commencer() {
    interrompre();
    signalerErreur(null);
    silence.current = { aParle: false, dernierSon: Date.now() };
    const ok = await enregistreur.demarrer();
    // Premir para falar: se o dedo já saiu antes de a gravação arrancar, descarta.
    if (ok && modeRef.current === "maintenir" && !doigtPose.current) {
      await enregistreur.arreter();
      signalerTropCourt();
    }
  }

  async function finir() {
    const gravacao = await enregistreur.arreter();
    if (!gravacao) return;
    if (gravacao.duree < DUREE_MIN_MS) {
      signalerTropCourt();
      return;
    }
    await envoyerAudio(await formulaireAudio(gravacao.uri));
  }

  // Mãos-livres: envia sozinho depois de uma pausa; em qualquer modo, corta aos 90 s.
  useEffect(() => {
    if (!enregistreur.enregistre) return;
    if (enregistreur.duree > DUREE_MAX_MS) {
      void finir();
      return;
    }
    if (modeMicro !== "mainsLibres" || enregistreur.metering === undefined) return;
    const maintenant = Date.now();
    if (enregistreur.metering > SEUIL_PAROLE_DB) {
      silence.current = { aParle: true, dernierSon: maintenant };
    } else if (silence.current.aParle && maintenant - silence.current.dernierSon > SILENCE_MS) {
      void finir();
    }
    // finir só usa o gravador e o envio, que não mudam o que este efeito observa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enregistreur.enregistre, enregistreur.duree, enregistreur.metering, modeMicro]);

  // Web: a tecla Espaço faz de botão do microfone (manter, em premir para falar; alternar, em
  // mãos-livres). Os handlers são refeitos a cada render para verem o estado atual.
  const enregistre = enregistreur.enregistre;
  useEffect(() => {
    if (Platform.OS !== "web" || saisie !== "voix") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || dansUnChamp(e.target)) return;
      e.preventDefault();
      if (!microActif) return;
      if (modeMicro === "maintenir") {
        if (!enregistre) {
          doigtPose.current = true;
          void commencer();
        }
      } else {
        void (enregistre ? finir() : commencer());
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space" || modeMicro !== "maintenir" || dansUnChamp(e.target)) return;
      doigtPose.current = false;
      if (enregistre) void finir();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // commencer e finir são funções do componente, refeitas a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saisie, microActif, modeMicro, enregistre]);

  /** Também fica como modo por omissão das próximas sessões. */
  const choisirMode = (mode: ModeMicro) => {
    modeRef.current = mode;
    modifierPreferences({ modeMicro: mode });
  };

  const choisirSaisie = (valeur: Saisie) => {
    saisieRef.current = valeur;
    setSaisie(valeur);
    if (valeur === "texte" && enregistreur.enregistre) {
      void enregistreur.arreter();
    }
  };

  const onEnvoyerTexte = async () => {
    const texte = brouillon.trim();
    setBrouillon("");
    if (!(await envoyer(texte))) {
      setBrouillon(texte);
    }
  };

  const onTerminer = async () => {
    if (enregistreur.enregistre) {
      await enregistreur.arreter();
    }
    if (etat.echange === 0 || !etat.sessionId) {
      arreterDeParler();
      router.dismissTo("/");
      return;
    }
    const feedback = await terminer();
    if (feedback) {
      ajouterSession({
        id: etat.sessionId,
        date: new Date().toISOString(),
        tache,
        niveau,
        langueAppui,
        echanges: etat.echange,
        dureeMs: etat.debut === null ? 0 : Date.now() - etat.debut,
        feedback,
      });
      router.replace({ pathname: "/feedback", params: { id: etat.sessionId } });
    }
  };

  const etatOrbe: EtatOrbe = occupee
    ? "pense"
    : enregistreur.enregistre
      ? "ecoute"
      : etat.parle
        ? "parle"
        : "attend";

  const statuts = t.session.statuts;
  const statut = etat.activite
    ? statuts[etat.activite]
    : enregistreur.enregistre
      ? statuts.ecoute
      : etat.parle
        ? statuts.parle
        : etat.terminee
          ? statuts.terminee
          : etat.sessionId
            ? statuts.aToi
            : statuts.sansSession;

  const libelleMicro = occupee
    ? t.session.micro.attente
    : enregistreur.enregistre
      ? modeMicro === "maintenir"
        ? t.session.micro.relacher
        : t.session.micro.toucherEnvoyer
      : modeMicro === "maintenir"
        ? t.session.micro.maintenir
        : t.session.micro.toucher;

  const microRefuse = enregistreur.permission === "refusee";

  const listeTranscription = (
    <ScrollView
      ref={defilement}
      style={styles.remplir}
      contentContainerStyle={styles.transcriptionContenu}
      onContentSizeChange={() => defilement.current?.scrollToEnd({ animated: true })}
    >
      {etat.repliques.map((replique, i) => (
        <View
          key={i}
          style={[
            styles.bulleBloc,
            replique.role === "camille" ? styles.bulleCamille : styles.bulleEleve,
          ]}
        >
          <Text style={styles.bulleAuteur}>
            {replique.role === "camille" ? "Camille" : t.communs.tu}
          </Text>
          <Text
            style={[
              styles.bulle,
              replique.role === "camille" ? styles.bulleFondCamille : styles.bulleFondEleve,
            ]}
          >
            {replique.texte}
          </Text>
        </View>
      ))}
    </ScrollView>
  );

  const scene = (
    <View style={styles.scene}>
      <OrbeCamille etat={etatOrbe} niveau={enregistreur.niveau} taille={168} />
      <Text style={styles.camilleNomGrand}>Camille</Text>
      <Text accessibilityLiveRegion="polite" style={styles.statut}>
        {statut}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={rejouer}
        disabled={etat.parle || occupee || etat.repliques.length === 0}
        style={styles.lien}
      >
        <Text style={styles.lienTexte}>{t.session.reecouter}</Text>
      </Pressable>
      <Text style={styles.aide}>{t.session.aide}</Text>
    </View>
  );

  const enteteCompacte = (
    <View style={styles.camilleCompacte}>
      <OrbeCamille etat={etatOrbe} niveau={enregistreur.niveau} />
      <View style={styles.camilleTextes}>
        <Text style={styles.camilleNom}>Camille</Text>
        <Text accessibilityLiveRegion="polite" style={styles.statutCompact}>
          {statut}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={rejouer}
        disabled={etat.parle || occupee}
        style={styles.lien}
      >
        <Text style={styles.lienTexte}>{t.session.reecouter}</Text>
      </Pressable>
    </View>
  );

  const bandeauErreur = etat.erreur && (
    <View accessibilityRole="alert" style={styles.erreur}>
      <Text style={styles.erreurTexte}>{t.erreurs[etat.erreur]}</Text>
      {etat.sessionId === null && (
        <Bouton libelle={t.session.reessayer} variante="secondaire" onPress={demarrer} />
      )}
    </View>
  );

  const pied = (
    <View style={styles.pied}>
      {etat.terminee ? (
        <Bouton
          libelle={t.session.voirFeedback}
          onPress={onTerminer}
          chargement={etat.activite === "evaluation"}
        />
      ) : saisie === "texte" || microRefuse ? (
        <View style={styles.piedTexte}>
          {microRefuse && (
            <View style={styles.avis}>
              <Text style={styles.avisTitre}>{t.session.microRefuse.titre}</Text>
              <Text style={styles.avisTexte}>{t.session.microRefuse.texte}</Text>
              {Platform.OS !== "web" && (
                <Bouton
                  libelle={t.session.microRefuse.ouvrir}
                  variante="secondaire"
                  onPress={() => void Linking.openSettings()}
                />
              )}
            </View>
          )}
          <View style={styles.saisie}>
            <TextInput
              accessibilityLabel={t.session.champ}
              value={brouillon}
              onChangeText={setBrouillon}
              placeholder={t.session.placeholder}
              placeholderTextColor={couleurs.encre3}
              multiline
              maxLength={2000}
              style={styles.champ}
            />
            <Bouton
              libelle={t.session.envoyer}
              onPress={onEnvoyerTexte}
              desactive={occupee || etat.sessionId === null || brouillon.trim() === ""}
              chargement={etat.activite === "reponse"}
              style={styles.envoyer}
            />
          </View>
          {!microRefuse && (
            <Pressable
              accessibilityRole="button"
              onPress={() => choisirSaisie("voix")}
              style={styles.lien}
            >
              <Text style={styles.lienTexte}>{t.session.repondreVoix}</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.piedVoix}>
          <Segments
            options={ModeMicroSchema.options.map((mode) => ({
              valeur: mode,
              libelle: t.session.modes[mode],
            }))}
            valeur={modeMicro}
            onChange={choisirMode}
            style={styles.segments}
          />
          <BoutonMicro
            enregistre={enregistreur.enregistre}
            desactive={!microActif}
            mode={modeMicro === "maintenir" ? "maintenir" : "basculer"}
            accessibilityLabel={libelleMicro}
            onDebut={() => {
              doigtPose.current = true;
              void commencer();
            }}
            onFin={() => {
              doigtPose.current = false;
              void finir();
            }}
          />
          <Text style={styles.libelleMicro}>
            {libelleMicro}
            {large && Platform.OS === "web" && (
              <Text style={styles.indice}>{` · ${t.session.micro.espace}`}</Text>
            )}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => choisirSaisie("texte")}
            style={styles.lien}
          >
            <Text style={styles.lienTexte}>{t.session.ecrire}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <Ecran>
      <KeyboardAvoidingView
        style={styles.remplir}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.entete}>
          <Pressable
            accessibilityRole="button"
            aria-disabled={occupee}
            disabled={occupee}
            onPress={onTerminer}
            style={[styles.petitBouton, occupee && styles.inactif]}
          >
            <Text style={styles.petitBoutonTexte}>{t.session.terminer}</Text>
          </Pressable>
          <View style={styles.enteteCentre}>
            <Text style={styles.tache}>{TACHES[tache].titre}</Text>
            <Text style={styles.compteur}>
              {t.session.echange(Math.min(etat.echange + 1, etat.maxEchanges), etat.maxEchanges)}
            </Text>
          </View>
          {large ? (
            // Em ecrãs largos a transcrição está sempre à vista: só um espaço para equilibrar.
            <View style={styles.petitBoutonFantome} />
          ) : (
            <Pressable
              accessibilityRole="button"
              aria-expanded={transcriptionVisible}
              accessibilityLabel={
                transcriptionVisible
                  ? t.session.masquerTranscription
                  : t.session.afficherTranscription
              }
              onPress={() => setTranscriptionVisible((v) => !v)}
              style={[styles.petitBouton, transcriptionVisible && styles.petitBoutonActif]}
            >
              <Text style={[styles.petitBoutonTexte, transcriptionVisible && styles.texteActif]}>
                {t.session.texte}
              </Text>
            </Pressable>
          )}
        </View>
        <View style={styles.progression}>
          <Progression actuel={etat.echange} total={etat.maxEchanges} />
        </View>

        {large ? (
          <View style={styles.colonnes}>
            <View style={styles.colonneCamille}>
              {scene}
              {bandeauErreur}
              {pied}
            </View>
            <View style={styles.colonneTranscription}>
              <Text accessibilityRole="header" style={styles.colonneTitre}>
                {t.session.transcription}
              </Text>
              {listeTranscription}
            </View>
          </View>
        ) : (
          <>
            {transcriptionVisible ? (
              <>
                {enteteCompacte}
                {listeTranscription}
              </>
            ) : (
              scene
            )}
            {bandeauErreur}
            {pied}
          </>
        )}
      </KeyboardAvoidingView>
    </Ecran>
  );
}

const useStyles = creerStyles((c) => ({
  remplir: { flex: 1 },
  entete: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  petitBouton: {
    minHeight: TOUCHE_MIN,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.ligne,
    backgroundColor: c.surface,
    justifyContent: "center",
  },
  petitBoutonFantome: { minWidth: 96 },
  petitBoutonActif: { backgroundColor: c.bleuDoux, borderColor: c.bleuTrait },
  petitBoutonTexte: { fontSize: 15, fontWeight: "600", color: c.encre },
  texteActif: { color: c.bleuEncre },
  inactif: { opacity: 0.5 },
  enteteCentre: { flex: 1, alignItems: "center", gap: 2 },
  tache: { fontFamily: serif, fontSize: 18, color: c.encre },
  compteur: { fontSize: 13, color: c.encre2 },
  progression: { paddingHorizontal: 20 },
  colonnes: { flex: 1, flexDirection: "row" },
  colonneCamille: { flex: 5, borderEndWidth: 1, borderColor: c.ligne },
  colonneTranscription: { flex: 6 },
  colonneTitre: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: c.encre2,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  scene: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 20 },
  camilleNomGrand: { fontFamily: serif, fontStyle: "italic", fontSize: 24, color: c.encre },
  camilleCompacte: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
    paddingBottom: 8,
  },
  camilleTextes: { flex: 1, gap: 2 },
  camilleNom: { fontFamily: serif, fontStyle: "italic", fontSize: 20, color: c.encre },
  statut: { fontSize: 15, fontWeight: "600", color: c.encre2, textAlign: "center" },
  statutCompact: { fontSize: 15, fontWeight: "600", color: c.encre2 },
  lien: { minHeight: TOUCHE_MIN, justifyContent: "center", paddingHorizontal: 8 },
  lienTexte: { fontSize: 15, fontWeight: "600", color: c.bleu, textAlign: "center" },
  aide: {
    fontSize: 13,
    lineHeight: 19,
    color: c.encre2,
    textAlign: "center",
    maxWidth: 300,
  },
  transcriptionContenu: { padding: 16, gap: 12 },
  bulleBloc: { maxWidth: "88%", gap: 4 },
  bulleCamille: { alignSelf: "flex-start" },
  bulleEleve: { alignSelf: "flex-end", alignItems: "flex-end" },
  bulleAuteur: { fontSize: 12, fontWeight: "600", color: c.encre2, paddingHorizontal: 4 },
  bulle: {
    ...FRANCAIS,
    fontSize: 16,
    lineHeight: 23,
    color: c.encre,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    overflow: "hidden",
  },
  bulleFondCamille: { backgroundColor: c.bleuDoux },
  bulleFondEleve: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.ligne,
  },
  erreur: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    gap: 10,
    borderRadius: 14,
    backgroundColor: c.ecouteDoux,
  },
  erreurTexte: { fontSize: 14, lineHeight: 20, color: c.ecouteEncre },
  pied: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: c.ligne,
  },
  piedVoix: { alignItems: "center", gap: 10 },
  piedTexte: { gap: 8 },
  segments: { alignSelf: "stretch" },
  libelleMicro: { fontSize: 15, fontWeight: "500", color: c.encre2, textAlign: "center" },
  indice: { fontWeight: "400", color: c.encre3 },
  avis: {
    padding: 14,
    gap: 8,
    borderRadius: 14,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.ligne,
  },
  avisTitre: { fontSize: 16, fontWeight: "600", color: c.encre },
  avisTexte: { fontSize: 14, lineHeight: 20, color: c.encre2 },
  saisie: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  champ: {
    ...styleTexte(false),
    flex: 1,
    minHeight: TOUCHE_MIN + 8,
    maxHeight: 140,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.ligne,
    backgroundColor: c.surface,
    fontSize: 16,
    color: c.encre,
  },
  envoyer: { paddingHorizontal: 16 },
}));
