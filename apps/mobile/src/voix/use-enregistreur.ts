import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useState } from "react";

export type Permission = "inconnue" | "accordee" | "refusee";

// Mono e 64 kbit/s chegam para voz e tornam o envio mais rápido.
const OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
  bitRate: 64_000,
  isMeteringEnabled: true,
};

/** Converte o nível do microfone (dBFS, de -160 a 0) numa escala de 0 a 1 para a animação. */
export function niveauSonore(metering: number | undefined): number {
  if (metering === undefined) return 0;
  return Math.min(1, Math.max(0, (metering + 50) / 50));
}

/** Gravação da resposta do aluno com o expo-audio. */
export function useEnregistreur() {
  const enregistreur = useAudioRecorder(OPTIONS);
  const etat = useAudioRecorderState(enregistreur, 150);
  const [permission, setPermission] = useState<Permission>("inconnue");

  /** Pede o microfone (só mostra o pedido do sistema na primeira vez). */
  const demanderPermission = async (): Promise<boolean> => {
    const { granted } = await requestRecordingPermissionsAsync();
    setPermission(granted ? "accordee" : "refusee");
    return granted;
  };

  const demarrer = async (): Promise<boolean> => {
    if (permission !== "accordee" && !(await demanderPermission())) {
      return false;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await enregistreur.prepareToRecordAsync();
    enregistreur.record();
    return true;
  };

  /** Para a gravação e devolve o URI do ficheiro e a duração (ms), ou null se não havia gravação. */
  const arreter = async (): Promise<{ uri: string; duree: number } | null> => {
    if (!enregistreur.getStatus().isRecording) {
      return null;
    }
    const duree = enregistreur.getStatus().durationMillis;
    await enregistreur.stop();
    await setAudioModeAsync({ allowsRecording: false });
    return enregistreur.uri ? { uri: enregistreur.uri, duree } : null;
  };

  return {
    permission,
    demanderPermission,
    demarrer,
    arreter,
    enregistre: etat.isRecording,
    duree: etat.durationMillis,
    niveau: niveauSonore(etat.metering),
    metering: etat.metering,
  };
}
