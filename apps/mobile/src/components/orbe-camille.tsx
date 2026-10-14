import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { couleurs, serif } from "../theme";

interface Props {
  /** "pense" enquanto se espera pela API; "attend" quando é a vez do aluno. */
  etat: "pense" | "attend";
  taille?: number;
}

/** Ilustração abstrata da Camille: anel que pulsa enquanto ela pensa. */
export function OrbeCamille({ etat, taille = 56 }: Props) {
  const [pulsation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (etat !== "pense") {
      pulsation.stopAnimation();
      pulsation.setValue(0);
      return;
    }
    const boucle = Animated.loop(
      Animated.timing(pulsation, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    boucle.start();
    return () => boucle.stop();
  }, [etat, pulsation]);

  const anneau = {
    opacity: pulsation.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
    transform: [{ scale: pulsation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
  };
  const couleur = etat === "pense" ? couleurs.pense : couleurs.bleu;

  return (
    <View
      accessible
      accessibilityLabel={etat === "pense" ? "A Camille está a pensar" : "Camille"}
      style={{ width: taille, height: taille, alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: taille / 2, backgroundColor: couleurs.bleuDoux },
          anneau,
        ]}
      />
      <View
        style={{
          width: taille * 0.78,
          height: taille * 0.78,
          borderRadius: taille,
          backgroundColor: couleur,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: couleurs.blanc,
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: taille * 0.4,
          }}
        >
          C
        </Text>
      </View>
    </View>
  );
}
