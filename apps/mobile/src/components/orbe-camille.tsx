import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useI18n } from "../i18n";
import { serif, useTheme } from "../theme";
import { useMouvementReduit } from "../theme/mouvement";
import { Text } from "./texte";

export type EtatOrbe = "parle" | "ecoute" | "pense" | "attend";

interface Props {
  etat: EtatOrbe;
  /** Nível do microfone (0 a 1), usado enquanto ouve o aluno. */
  niveau?: number;
  taille?: number;
}

/**
 * Ilustração abstrata da Camille. Fala: núcleo azul com anel a pulsar.
 * Ouve: contorno laranja que cresce com a tua voz. Pensa: núcleo cinzento a pulsar.
 */
export function OrbeCamille({ etat, niveau = 0, taille = 56 }: Props) {
  const { couleurs } = useTheme();
  const { t } = useI18n();
  const mouvementReduit = useMouvementReduit();
  const [pulsation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (mouvementReduit || (etat !== "parle" && etat !== "pense")) {
      pulsation.stopAnimation();
      pulsation.setValue(0);
      return;
    }
    const boucle = Animated.loop(
      Animated.timing(pulsation, {
        toValue: 1,
        duration: etat === "parle" ? 1200 : 1600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    boucle.start();
    return () => boucle.stop();
  }, [etat, mouvementReduit, pulsation]);

  const anneau = mouvementReduit
    ? { opacity: 0.4, transform: [{ scale: 1 }] }
    : etat === "ecoute"
      ? { opacity: 0.35 + niveau * 0.5, transform: [{ scale: 1 + niveau * 0.35 }] }
      : {
          opacity: pulsation.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
          transform: [
            { scale: pulsation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) },
          ],
        };

  const noyau =
    etat === "ecoute"
      ? { backgroundColor: couleurs.surface, borderWidth: 3, borderColor: couleurs.ecoute }
      : { backgroundColor: etat === "pense" ? couleurs.pense : couleurs.bleu };

  return (
    <View
      accessible
      accessibilityLabel={t.orbe[etat]}
      style={{ width: taille, height: taille, alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: taille / 2,
            backgroundColor: etat === "ecoute" ? couleurs.ecouteDoux : couleurs.bleuDoux,
          },
          anneau,
        ]}
      />
      <View
        style={[
          {
            width: taille * 0.72,
            height: taille * 0.72,
            borderRadius: taille,
            alignItems: "center",
            justifyContent: "center",
          },
          noyau,
        ]}
      >
        <Text
          style={{
            color: etat === "ecoute" ? couleurs.ecoute : couleurs.surPlein,
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: taille * 0.36,
          }}
        >
          C
        </Text>
      </View>
    </View>
  );
}
