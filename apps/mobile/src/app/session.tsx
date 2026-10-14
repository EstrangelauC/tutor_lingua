import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bouton } from "../components/bouton";
import { BoutonMicro } from "../components/bouton-micro";
import { OrbeCamille, type EtatOrbe } from "../components/orbe-camille";
import { Progression } from "../components/progression";
import { TACHES } from "../libelles";
import { useContexteSession } from "../session/session-context";
import { useSessionCamille, type Activite } from "../session/use-session-camille";
import { TOUCHE_MIN, couleurs, serif } from "../theme";
import { formulaireAudio } from "../voix/formulaire-audio";
import { arreterDeParler } from "../voix/parole";
import { useEnregistreur } from "../voix/use-enregistreur";

type ModeMicro = "maintenir" | "mainsLibres";
type Saisie = "voix" | "texte";

const STATUTS: Record<Exclude<Activite, null>, string> = {
  demarrage: "A Camille está a preparar-se…",
  reponse: "A Camille está a pensar…",
  evaluation: "A Camille está a preparar o teu feedback…",
};

/** Abaixo disto (dBFS) conta como silêncio. */
const SEUIL_PAROLE_DB = -40;
/** Mãos-livres: envia depois deste silêncio a seguir a ter falado. */
const SILENCE_MS = 1_800;
/** Gravações mais curtas são quase sempre toques acidentais. */
const DUREE_MIN_MS = 600;
const DUREE_MAX_MS = 90_000;

export default function Session() {
  const router = useRouter();
  const { config, setFeedback } = useContexteSession();
  const enregistreur = useEnregistreur();
  const [modeMicro, setModeMicro] = useState<ModeMicro>("maintenir");
  const [saisie, setSaisie] = useState<Saisie>("voix");
  const [transcriptionVisible, setTranscriptionVisible] = useState(false);
  const [brouillon, setBrouillon] = useState("");
  const defilement = useRef<ScrollView>(null);

  // Lidos dentro de callbacks assíncronos, que podem vir de um render anterior.
  const modeRef = useRef<ModeMicro>("maintenir");
  const saisieRef = useRef<Saisie>("voix");
  const doigtPose = useRef(false);
  const silence = useRef({ aParle: false, dernierSon: 0 });

  const { etat, demarrer, envoyer, envoyerAudio, rejouer, terminer, interrompre, signalerErreur } =
    useSessionCamille(config, {
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

  const signalerTropCourt = () =>
    signalerErreur(
      modeRef.current === "maintenir"
        ? "Gravação muito curta. Mantém o microfone premido enquanto falas."
        : "Gravação muito curta. Tenta outra vez.",
    );

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

  const choisirMode = (mode: ModeMicro) => {
    modeRef.current = mode;
    setModeMicro(mode);
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
    if (etat.echange === 0) {
      arreterDeParler();
      router.dismissTo("/");
      return;
    }
    const feedback = await terminer();
    if (feedback) {
      setFeedback(feedback);
      router.replace("/feedback");
    }
  };

  const etatOrbe: EtatOrbe = occupee
    ? "pense"
    : enregistreur.enregistre
      ? "ecoute"
      : etat.parle
        ? "parle"
        : "attend";

  const statut = etat.activite
    ? STATUTS[etat.activite]
    : enregistreur.enregistre
      ? "A ouvir-te…"
      : etat.parle
        ? "A Camille está a falar"
        : etat.terminee
          ? "Sessão terminada"
          : etat.sessionId
            ? "É a tua vez"
            : "Sem sessão";

  const libelleMicro = occupee
    ? "Um momento…"
    : enregistreur.enregistre
      ? modeMicro === "maintenir"
        ? "Solta para enviar"
        : "Toca para enviar (ou faz uma pausa)"
      : modeMicro === "maintenir"
        ? "Mantém premido para falar"
        : "Toca para falar";

  const microRefuse = enregistreur.permission === "refusee";

  return (
    <SafeAreaView style={styles.ecran} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.ecran}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.entete}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: occupee }}
            disabled={occupee}
            onPress={onTerminer}
            style={[styles.petitBouton, occupee && styles.inactif]}
          >
            <Text style={styles.petitBoutonTexte}>Terminar</Text>
          </Pressable>
          <View style={styles.enteteCentre}>
            <Text style={styles.tache}>{TACHES[config.tache].titre}</Text>
            <Text style={styles.compteur}>
              Troca {Math.min(etat.echange + 1, etat.maxEchanges)} de {etat.maxEchanges}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: transcriptionVisible }}
            accessibilityLabel={
              transcriptionVisible ? "Ocultar transcrição" : "Mostrar transcrição"
            }
            onPress={() => setTranscriptionVisible((v) => !v)}
            style={[styles.petitBouton, transcriptionVisible && styles.petitBoutonActif]}
          >
            <Text style={[styles.petitBoutonTexte, transcriptionVisible && styles.texteActif]}>
              Texto
            </Text>
          </Pressable>
        </View>
        <View style={styles.progression}>
          <Progression actuel={etat.echange} total={etat.maxEchanges} />
        </View>

        {transcriptionVisible ? (
          <>
            <View style={styles.camilleCompacte}>
              <OrbeCamille etat={etatOrbe} niveau={enregistreur.niveau} />
              <View style={styles.camilleTextes}>
                <Text style={styles.camilleNom}>Camille</Text>
                <Text accessibilityLiveRegion="polite" style={styles.statut}>
                  {statut}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={rejouer}
                disabled={etat.parle || occupee}
                style={styles.lien}
              >
                <Text style={styles.lienTexte}>Ouvir outra vez</Text>
              </Pressable>
            </View>
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
                    {replique.role === "camille" ? "Camille" : "Tu"}
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
          </>
        ) : (
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
              <Text style={styles.lienTexte}>Ouvir outra vez</Text>
            </Pressable>
            <Text style={styles.aide}>
              Sem correções durante o exercício. O feedback chega no fim.
            </Text>
          </View>
        )}

        {etat.erreur && (
          <View accessibilityRole="alert" style={styles.erreur}>
            <Text style={styles.erreurTexte}>{etat.erreur}</Text>
            {etat.sessionId === null && (
              <Bouton libelle="Tentar outra vez" variante="secondaire" onPress={demarrer} />
            )}
          </View>
        )}

        <View style={styles.pied}>
          {etat.terminee ? (
            <Bouton
              libelle="Ver o feedback"
              onPress={onTerminer}
              chargement={etat.activite === "evaluation"}
            />
          ) : saisie === "texte" || microRefuse ? (
            <View style={styles.piedTexte}>
              {microRefuse && (
                <View style={styles.avis}>
                  <Text style={styles.avisTitre}>A Camille não te consegue ouvir</Text>
                  <Text style={styles.avisTexte}>
                    O acesso ao microfone foi recusado. Podes responder por escrito ou ativar o
                    microfone nas definições.
                  </Text>
                  {Platform.OS !== "web" && (
                    <Bouton
                      libelle="Abrir definições"
                      variante="secondaire"
                      onPress={() => void Linking.openSettings()}
                    />
                  )}
                </View>
              )}
              <View style={styles.saisie}>
                <TextInput
                  accessibilityLabel="A tua resposta em francês"
                  value={brouillon}
                  onChangeText={setBrouillon}
                  placeholder="Escreve a tua resposta em francês…"
                  placeholderTextColor={couleurs.encre3}
                  multiline
                  maxLength={2000}
                  style={styles.champ}
                />
                <Bouton
                  libelle="Enviar"
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
                  <Text style={styles.lienTexte}>Responder com a voz</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.piedVoix}>
              <View accessibilityRole="radiogroup" style={styles.segments}>
                {(
                  [
                    ["maintenir", "Premir para falar"],
                    ["mainsLibres", "Mãos-livres"],
                  ] as const
                ).map(([mode, libelle]) => (
                  <Pressable
                    key={mode}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: modeMicro === mode }}
                    onPress={() => choisirMode(mode)}
                    style={[styles.segment, modeMicro === mode && styles.segmentChoisi]}
                  >
                    <Text
                      style={[styles.segmentTexte, modeMicro === mode && styles.segmentTexteChoisi]}
                    >
                      {libelle}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <BoutonMicro
                enregistre={enregistreur.enregistre}
                desactive={occupee || etat.sessionId === null}
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
              <Text style={styles.libelleMicro}>{libelleMicro}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => choisirSaisie("texte")}
                style={styles.lien}
              >
                <Text style={styles.lienTexte}>Escrever a resposta</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
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
    borderColor: couleurs.ligne,
    backgroundColor: couleurs.surface,
    justifyContent: "center",
  },
  petitBoutonActif: { backgroundColor: couleurs.bleuDoux, borderColor: "#B9C6F3" },
  petitBoutonTexte: { fontSize: 15, fontWeight: "600", color: couleurs.encre },
  texteActif: { color: couleurs.bleuEncre },
  inactif: { opacity: 0.5 },
  enteteCentre: { flex: 1, alignItems: "center", gap: 2 },
  tache: { fontFamily: serif, fontSize: 18, color: couleurs.encre },
  compteur: { fontSize: 13, color: couleurs.encre2 },
  progression: { paddingHorizontal: 20 },
  scene: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 20 },
  camilleNomGrand: { fontFamily: serif, fontStyle: "italic", fontSize: 24, color: couleurs.encre },
  camilleCompacte: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
    paddingBottom: 8,
  },
  camilleTextes: { flex: 1, gap: 2 },
  camilleNom: { fontFamily: serif, fontStyle: "italic", fontSize: 20, color: couleurs.encre },
  statut: { fontSize: 15, fontWeight: "600", color: couleurs.encre2, textAlign: "center" },
  lien: { minHeight: TOUCHE_MIN, justifyContent: "center", paddingHorizontal: 8 },
  lienTexte: { fontSize: 15, fontWeight: "600", color: couleurs.bleu, textAlign: "center" },
  aide: {
    fontSize: 13,
    lineHeight: 19,
    color: couleurs.encre2,
    textAlign: "center",
    maxWidth: 300,
  },
  transcriptionContenu: { padding: 16, gap: 12 },
  bulleBloc: { maxWidth: "88%", gap: 4 },
  bulleCamille: { alignSelf: "flex-start" },
  bulleEleve: { alignSelf: "flex-end", alignItems: "flex-end" },
  bulleAuteur: { fontSize: 12, fontWeight: "600", color: couleurs.encre2, paddingHorizontal: 4 },
  bulle: {
    fontFamily: serif,
    fontSize: 16,
    lineHeight: 23,
    color: couleurs.encre,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    overflow: "hidden",
  },
  bulleFondCamille: { backgroundColor: couleurs.bleuDoux },
  bulleFondEleve: {
    backgroundColor: couleurs.surface,
    borderWidth: 1,
    borderColor: couleurs.ligne,
  },
  erreur: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    gap: 10,
    borderRadius: 14,
    backgroundColor: couleurs.ecouteDoux,
  },
  erreurTexte: { fontSize: 14, lineHeight: 20, color: couleurs.ecouteEncre },
  pied: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: couleurs.ligne,
  },
  piedVoix: { alignItems: "center", gap: 10 },
  piedTexte: { gap: 8 },
  segments: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 16,
    backgroundColor: couleurs.discret,
  },
  segment: {
    flex: 1,
    minHeight: TOUCHE_MIN,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentChoisi: { backgroundColor: couleurs.surface },
  segmentTexte: { fontSize: 14, fontWeight: "500", color: couleurs.encre2, textAlign: "center" },
  segmentTexteChoisi: { fontWeight: "700", color: couleurs.encre },
  libelleMicro: { fontSize: 15, fontWeight: "500", color: couleurs.encre2, textAlign: "center" },
  avis: {
    padding: 14,
    gap: 8,
    borderRadius: 14,
    backgroundColor: couleurs.surface,
    borderWidth: 1,
    borderColor: couleurs.ligne,
  },
  avisTitre: { fontSize: 16, fontWeight: "600", color: couleurs.encre },
  avisTexte: { fontSize: 14, lineHeight: 20, color: couleurs.encre2 },
  saisie: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  champ: {
    flex: 1,
    minHeight: TOUCHE_MIN + 8,
    maxHeight: 140,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    backgroundColor: couleurs.surface,
    fontSize: 16,
    color: couleurs.encre,
  },
  envoyer: { paddingHorizontal: 16 },
});
