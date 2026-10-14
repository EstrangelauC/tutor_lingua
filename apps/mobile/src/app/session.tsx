import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
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
import { OrbeCamille } from "../components/orbe-camille";
import { Progression } from "../components/progression";
import { TACHES } from "../libelles";
import { useContexteSession } from "../session/session-context";
import { useSessionCamille, type Activite } from "../session/use-session-camille";
import { TOUCHE_MIN, couleurs, serif } from "../theme";

const STATUTS: Record<Exclude<Activite, null>, string> = {
  demarrage: "A Camille está a preparar-se…",
  reponse: "A Camille está a pensar…",
  evaluation: "A Camille está a preparar o teu feedback…",
};

export default function Session() {
  const router = useRouter();
  const { config, setFeedback } = useContexteSession();
  const { etat, demarrer, envoyer, terminer } = useSessionCamille(config);
  const [brouillon, setBrouillon] = useState("");
  const defilement = useRef<ScrollView>(null);

  // Cria a sessão ao abrir o ecrã.
  useEffect(() => {
    void demarrer();
  }, [demarrer]);

  const occupee = etat.activite !== null;
  const peutEnvoyer =
    !occupee && !etat.terminee && etat.sessionId !== null && brouillon.trim() !== "";

  const onEnvoyer = async () => {
    const texte = brouillon.trim();
    setBrouillon("");
    if (!(await envoyer(texte))) {
      setBrouillon(texte);
    }
  };

  const onTerminer = async () => {
    if (etat.echange === 0) {
      router.dismissTo("/");
      return;
    }
    const feedback = await terminer();
    if (feedback) {
      setFeedback(feedback);
      router.replace("/feedback");
    }
  };

  const statut = etat.activite
    ? STATUTS[etat.activite]
    : etat.terminee
      ? "Sessão terminada"
      : etat.sessionId
        ? "É a tua vez"
        : "Sem sessão";

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
            style={[styles.terminer, occupee && styles.inactif]}
          >
            <Text style={styles.terminerTexte}>Terminar</Text>
          </Pressable>
          <View style={styles.enteteCentre}>
            <Text style={styles.tache}>{TACHES[config.tache].titre}</Text>
            <Text style={styles.compteur}>
              Troca {Math.min(etat.echange + 1, etat.maxEchanges)} de {etat.maxEchanges}
            </Text>
          </View>
          <View style={styles.enteteEspace} />
        </View>
        <View style={styles.progression}>
          <Progression actuel={etat.echange} total={etat.maxEchanges} />
        </View>

        <View style={styles.camille}>
          <OrbeCamille etat={occupee ? "pense" : "attend"} />
          <View style={styles.camilleTextes}>
            <Text style={styles.camilleNom}>Camille</Text>
            <Text accessibilityLiveRegion="polite" style={styles.statut}>
              {statut}
            </Text>
          </View>
        </View>

        <ScrollView
          ref={defilement}
          style={styles.transcription}
          contentContainerStyle={styles.transcriptionContenu}
          onContentSizeChange={() => defilement.current?.scrollToEnd({ animated: true })}
        >
          <Text style={styles.aide}>
            Sem correções durante o exercício. O feedback chega no fim.
          </Text>
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
          ) : (
            <View style={styles.saisie}>
              <TextInput
                accessibilityLabel="A tua resposta em francês"
                value={brouillon}
                onChangeText={setBrouillon}
                placeholder="Escreve a tua resposta em francês…"
                placeholderTextColor={couleurs.encre3}
                multiline
                maxLength={2000}
                editable={!etat.terminee}
                style={styles.champ}
              />
              <Bouton
                libelle="Enviar"
                onPress={onEnvoyer}
                desactive={!peutEnvoyer}
                chargement={etat.activite === "reponse"}
                style={styles.envoyer}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  entete: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  terminer: {
    minHeight: TOUCHE_MIN,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    backgroundColor: couleurs.surface,
    justifyContent: "center",
  },
  terminerTexte: { fontSize: 15, fontWeight: "600", color: couleurs.encre },
  inactif: { opacity: 0.5 },
  enteteCentre: { flex: 1, alignItems: "center", gap: 2 },
  enteteEspace: { width: 48 },
  tache: { fontFamily: serif, fontSize: 18, color: couleurs.encre },
  compteur: { fontSize: 13, color: couleurs.encre2 },
  progression: { paddingHorizontal: 20 },
  camille: { flexDirection: "row", alignItems: "center", gap: 12, padding: 20, paddingBottom: 8 },
  camilleTextes: { flex: 1, gap: 2 },
  camilleNom: { fontFamily: serif, fontStyle: "italic", fontSize: 20, color: couleurs.encre },
  statut: { fontSize: 14, fontWeight: "600", color: couleurs.encre2 },
  transcription: { flex: 1 },
  transcriptionContenu: { padding: 16, gap: 12 },
  aide: { fontSize: 13, lineHeight: 19, color: couleurs.encre2, textAlign: "center" },
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
