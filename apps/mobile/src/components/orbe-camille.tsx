import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { couleurs, serif } from "../theme";

export type EtatOrbe = "parle" | "ecoute" | "pense" | "attend";

interface Props {
  etat: EtatOrbe;
  /** Nível do microfone (0 a 1), usado enquanto ouve o aluno. */
  niveau?: number;
  taille?: number;
}

const LIBELLES: Record<EtatOrbe, string> = {
  parle: "A Camille está a falar",
  ecoute: "A Camille está a ouvir-te",
  pense: "A Camille está a pensar",
  attend: "Camille",
};

/**
 * Ilustração abstrata da Camille. Fala: núcleo azul com anel a pulsar.
 * Ouve: contorno laranja que cresce com a tua voz. Pensa: núcleo cinzento a pulsar.
 */
export function OrbeCamille({ etat, niveau = 0, taille = 56 }: Props) {
  const [pulsation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (etat !== "parle" && etat !== "pense") {
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
  }, [etat, pulsation]);

  const anneau =
    etat === "ecoute"
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
      accessibilityLabel={LIBELLES[etat]}
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
            color: etat === "ecoute" ? couleurs.ecoute : couleurs.blanc,
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
