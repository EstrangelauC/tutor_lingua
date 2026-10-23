import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** Conservateur pendant la lecture initiale de la préférence système. */
export function useMouvementReduit() {
  const [reduit, setReduit] = useState(true);
  useEffect(() => {
    let actif = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (actif) setReduit(value);
      })
      .catch(() => undefined);
    const abonnement = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduit);
    return () => {
      actif = false;
      abonnement.remove();
    };
  }, []);
  return reduit;
}
