import { useMouvementReduit } from "../theme/mouvement";
import type { Replique } from "@camille/shared";
import { useRef } from "react";
import { ScrollView, View } from "react-native";
import { FRANCAIS, useI18n } from "../i18n";
import { TYPOGRAPHIE, RAYONS, creerStyles } from "../theme";
import { Text } from "./texte";

/** A conversa em bolhas, sempre com a última fala à vista. */
export function Transcription({ repliques }: { repliques: readonly Replique[] }) {
  const styles = useStyles();
  const mouvementReduit = useMouvementReduit();
  const { t } = useI18n();
  const defilement = useRef<ScrollView>(null);
  return (
    <ScrollView
      ref={defilement}
      style={styles.remplir}
      contentContainerStyle={styles.contenu}
      onContentSizeChange={() => defilement.current?.scrollToEnd({ animated: !mouvementReduit })}
    >
      {repliques.map((replique, i) => (
        <View
          key={i}
          style={[styles.bloc, replique.role === "camille" ? styles.blocCamille : styles.blocEleve]}
        >
          <Text style={styles.auteur}>
            {replique.role === "camille" ? "Camille" : t.communs.tu}
          </Text>
          <Text
            style={[
              styles.bulle,
              replique.role === "camille" ? styles.fondCamille : styles.fondEleve,
            ]}
          >
            {replique.texte}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const useStyles = creerStyles((c) => ({
  remplir: { flex: 1 },
  contenu: { padding: 16, gap: 12 },
  bloc: { maxWidth: "88%", gap: 4 },
  blocCamille: { alignSelf: "flex-start" },
  blocEleve: { alignSelf: "flex-end", alignItems: "flex-end" },
  auteur: { fontSize: 12, fontWeight: "600", color: c.encre2, paddingHorizontal: 4 },
  bulle: {
    ...TYPOGRAPHIE.francais,
    ...FRANCAIS,
    color: c.encre,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RAYONS.carte,
    overflow: "hidden",
  },
  fondCamille: { backgroundColor: c.bleuDoux },
  fondEleve: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.ligne },
}));
