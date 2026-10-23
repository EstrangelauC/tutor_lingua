import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import type { ModeMicro } from "../donnees/preferences";
import { formulaireAudio } from "./formulaire-audio";
import { useEnregistreur } from "./use-enregistreur";
import bipSource from "../../assets/sons/bip.wav";

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

interface Options {
  mode: ModeMicro;
  /** O microfone pode ser usado agora (há sessão, não está terminada, a Camille não está ocupada). */
  actif: boolean;
  /** Na web, a tecla Espaço só faz de microfone enquanto se responde por voz. */
  clavier: boolean;
  /** Vibração ao começar e acabar; bip quando o microfone abre sozinho. */
  retours: boolean;
  /** Chamado antes de gravar (para interromper a Camille e limpar o erro anterior). */
  onAvantGravacao: () => void;
  onEnvoyer: (audio: FormData) => Promise<unknown>;
  onTropCourt: () => void;
}

/**
 * Gravação da resposta do aluno nos dois modos: premir para falar e mãos-livres (abre sozinho,
 * envia depois de uma pausa). Trata também da tecla Espaço na web, da duração máxima e dos
 * retornos (vibração, bip).
 */
export function useMicro(options: Options) {
  const enregistreur = useEnregistreur();
  // Sinal curto quando o microfone abre sozinho (mãos-livres): sem ele não se sabe quando falar.
  const bip = useAudioPlayer(bipSource);

  // Lidos dentro de callbacks assíncronos, que podem vir de um render anterior.
  const derniers = useRef({ options, enregistreur });
  useEffect(() => {
    derniers.current = { options, enregistreur };
  });
  const doigtPose = useRef(false);
  const arretEnCours = useRef(false);
  const silence = useRef({ aParle: false, dernierSon: 0 });

  const vibrer = (style: Haptics.ImpactFeedbackStyle) => {
    if (derniers.current.options.retours && Platform.OS !== "web") {
      void Haptics.impactAsync(style).catch(() => undefined);
    }
  };

  /** `automatique`: o microfone abriu sozinho (mãos-livres), avisa-se com um bip. */
  const commencer = useCallback(
    async (automatique = false) => {
      const { options: o, enregistreur: e } = derniers.current;
      o.onAvantGravacao();
      silence.current = { aParle: false, dernierSon: Date.now() };
      const ok = await e.demarrer();
      if (!ok) return;
      vibrer(Haptics.ImpactFeedbackStyle.Light);
      if (automatique && o.retours) {
        bip.seekTo(0);
        bip.play();
      }
      // Premir para falar: se o dedo já saiu antes de a gravação arrancar, descarta.
      if (o.mode === "maintenir" && !doigtPose.current) {
        await e.arreter();
        o.onTropCourt();
      }
    },
    [bip],
  );

  const finir = useCallback(async () => {
    if (arretEnCours.current) return;
    arretEnCours.current = true;
    try {
      const { options: o, enregistreur: e } = derniers.current;
      const gravacao = await e.arreter();
      if (!gravacao) return;
      vibrer(Haptics.ImpactFeedbackStyle.Medium);
      if (gravacao.duree < DUREE_MIN_MS) {
        o.onTropCourt();
        return;
      }
      await o.onEnvoyer(await formulaireAudio(gravacao.uri));
    } finally {
      arretEnCours.current = false;
    }
  }, []);

  const { enregistre, duree, metering } = enregistreur;
  const { mode, actif, clavier } = options;

  // Mãos-livres: envia sozinho depois de uma pausa; em qualquer modo, corta aos 90 s.
  useEffect(() => {
    if (!enregistre) return;
    if (duree > DUREE_MAX_MS) {
      void finir();
      return;
    }
    if (mode !== "mainsLibres" || metering === undefined) return;
    const maintenant = Date.now();
    if (metering > SEUIL_PAROLE_DB) {
      silence.current = { aParle: true, dernierSon: maintenant };
    } else if (silence.current.aParle && maintenant - silence.current.dernierSon > SILENCE_MS) {
      void finir();
    }
  }, [enregistre, duree, metering, mode, finir]);

  // Web: a tecla Espaço faz de botão do microfone (manter, em premir para falar; alternar, em
  // mãos-livres).
  useEffect(() => {
    if (Platform.OS !== "web" || !clavier) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || dansUnChamp(e.target)) return;
      e.preventDefault();
      if (!actif) return;
      if (mode === "maintenir") {
        if (!enregistre) {
          doigtPose.current = true;
          void commencer();
        }
      } else {
        void (enregistre ? finir() : commencer());
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space" || mode !== "maintenir" || dansUnChamp(e.target)) return;
      doigtPose.current = false;
      if (enregistre) void finir();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [clavier, actif, mode, enregistre, commencer, finir]);

  return {
    enregistre,
    niveau: enregistreur.niveau,
    permission: enregistreur.permission,
    /** Abre o microfone (com bip se `automatique`, em mãos-livres). */
    commencer,
    /** Para a gravação e envia-a (ou descarta-a, se for curta de mais). */
    finir,
    /** Para a gravação sem enviar. */
    annuler: () => (enregistreur.enregistre ? enregistreur.arreter() : Promise.resolve(null)),
    /** Para o botão: o dedo pousou / levantou. */
    onDebut: () => {
      doigtPose.current = true;
      void commencer();
    },
    onFin: () => {
      doigtPose.current = false;
      void finir();
    },
  };
}
