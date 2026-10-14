import {
  LangueAppuiSchema,
  NiveauSchema,
  TacheSchema,
  type CreerSessionRequest,
} from "@camille/shared";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bouton } from "../components/bouton";
import { LANGUES, NIVEAUX, TACHES } from "../libelles";
import { useContexteSession } from "../session/session-context";
import { TOUCHE_MIN, couleurs, serif } from "../theme";

export default function Accueil() {
  const router = useRouter();
  const { config, setConfig } = useContexteSession();
  const choisir = (partiel: Partial<CreerSessionRequest>) => setConfig({ ...config, ...partiel });

  return (
    <SafeAreaView style={styles.ecran} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.marque}>
          <View style={styles.pastille}>
            <Text style={styles.pastilleTexte}>C</Text>
          </View>
          <Text style={styles.marqueTexte}>Camille</Text>
          <Text style={styles.marqueSous}>Oral TCF IRN</Text>
        </View>

        <Text accessibilityRole="header" style={styles.titre}>
          Vamos praticar?
        </Text>

        <Section titre="Escolhe uma tarefa">
          <View accessibilityRole="radiogroup" style={styles.pile}>
            {TacheSchema.options.map((tache) => {
              const choisie = config.tache === tache;
              const { titre, description, numero } = TACHES[tache];
              return (
                <Pressable
                  key={tache}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: choisie }}
                  onPress={() => choisir({ tache })}
                  style={[styles.carte, choisie && styles.carteChoisie]}
                >
                  <View style={styles.carteTete}>
                    <Text style={styles.carteTitre}>{titre}</Text>
                    <Text style={styles.carteNumero}>Tâche {numero}</Text>
                  </View>
                  <Text style={styles.carteDescription}>{description}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section titre="Nível alvo">
          <View accessibilityRole="radiogroup" style={styles.segments}>
            {NiveauSchema.options.map((niveau) => {
              const choisi = config.niveau === niveau;
              return (
                <Pressable
                  key={niveau}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: choisi }}
                  accessibilityLabel={`${niveau}, ${NIVEAUX[niveau]}`}
                  onPress={() => choisir({ niveau })}
                  style={[styles.segment, choisi && styles.segmentChoisi]}
                >
                  <Text style={[styles.segmentTexte, choisi && styles.segmentTexteChoisi]}>
                    {niveau}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.aide}>{NIVEAUX[config.niveau]}</Text>
        </Section>

        <Section titre="Língua do feedback">
          <View accessibilityRole="radiogroup" style={styles.puces}>
            {LangueAppuiSchema.options.map((langue) => {
              const choisie = config.langueAppui === langue;
              return (
                <Pressable
                  key={langue}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: choisie }}
                  onPress={() => choisir({ langueAppui: langue })}
                  style={[styles.puce, choisie && styles.puceChoisie]}
                >
                  <Text style={[styles.puceTexte, choisie && styles.puceTexteChoisie]}>
                    {LANGUES[langue]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.aide}>A conversa com a Camille é sempre em francês.</Text>
        </Section>
      </ScrollView>

      <View style={styles.pied}>
        <Bouton libelle="Começar" onPress={() => router.push("/session")} />
      </View>
    </SafeAreaView>
  );
}

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitre}>
        {titre}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: 20, gap: 24 },
  marque: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  pastille: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: couleurs.bleu,
    alignItems: "center",
    justifyContent: "center",
  },
  pastilleTexte: { color: couleurs.blanc, fontFamily: serif, fontStyle: "italic", fontSize: 18 },
  marqueTexte: { fontFamily: serif, fontStyle: "italic", fontSize: 20, color: couleurs.encre },
  marqueSous: { fontSize: 14, color: couleurs.encre2 },
  titre: { fontSize: 26, fontWeight: "600", color: couleurs.encre },
  section: { gap: 10 },
  sectionTitre: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: couleurs.encre2,
  },
  pile: { gap: 10 },
  carte: {
    minHeight: 84,
    padding: 16,
    gap: 4,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: couleurs.ligne,
    backgroundColor: couleurs.surface,
  },
  carteChoisie: { borderColor: couleurs.bleu, backgroundColor: couleurs.bleuDoux },
  carteTete: { flexDirection: "row", alignItems: "baseline", gap: 8, flexWrap: "wrap" },
  carteTitre: { fontFamily: serif, fontSize: 19, color: couleurs.encre },
  carteNumero: { fontSize: 12, color: couleurs.encre3 },
  carteDescription: { fontSize: 14, lineHeight: 20, color: couleurs.encre2 },
  segments: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 14,
    backgroundColor: couleurs.discret,
  },
  segment: {
    flex: 1,
    minHeight: TOUCHE_MIN,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentChoisi: { backgroundColor: couleurs.surface },
  segmentTexte: { fontSize: 16, fontWeight: "500", color: couleurs.encre2 },
  segmentTexteChoisi: { fontWeight: "700", color: couleurs.encre },
  puces: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  puce: {
    minHeight: TOUCHE_MIN,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    backgroundColor: couleurs.surface,
    justifyContent: "center",
  },
  puceChoisie: { backgroundColor: couleurs.encre, borderColor: couleurs.encre },
  puceTexte: { fontSize: 15, color: couleurs.encre },
  puceTexteChoisie: { color: couleurs.blanc, fontWeight: "600" },
  aide: { fontSize: 14, lineHeight: 20, color: couleurs.encre2 },
  pied: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: couleurs.ligne,
  },
});
