import * as Speech from "expo-speech";

/** Um pouco mais devagar do que o normal: quem ouve está a aprender. */
const VITESSE = 0.95;

/** "fin" quando a leitura acaba sozinha; "interrompue" quando alguém a parou. */
export type FinParole = "fin" | "interrompue";

/**
 * Lê `texte` em francês e resolve quando a leitura acaba ou é interrompida.
 * Há um limite de tempo de segurança: sem voz francesa instalada, alguns
 * sistemas nunca chamam onDone.
 */
export function parler(texte: string): Promise<FinParole> {
  return new Promise((resolve) => {
    let fini = false;
    const terminer = (fin: FinParole) => {
      if (fini) return;
      fini = true;
      clearTimeout(securite);
      resolve(fin);
    };
    const securite = setTimeout(() => terminer("fin"), Math.min(30_000, 1_500 + texte.length * 90));
    Speech.speak(texte, {
      language: "fr-FR",
      rate: VITESSE,
      // Sessão de áudio própria no iOS: a leitura não é afetada pelo modo de gravação.
      useApplicationAudioSession: false,
      onDone: () => terminer("fin"),
      onStopped: () => terminer("interrompue"),
      onError: () => terminer("fin"),
    });
  });
}

export function arreterDeParler(): void {
  void Speech.stop();
}
