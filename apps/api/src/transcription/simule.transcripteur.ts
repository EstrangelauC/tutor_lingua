import type { Transcripteur } from "./transcripteur";

// Inclui um erro típico, para o feedback simulado ter algo a assinalar.
const PHRASES = [
  "Bonjour, je m'appelle Nour et j'habite à Lyon depuis deux ans.",
  "Je travaille dans un restaurant et j'aime beaucoup cuisiner.",
  "Si j'aurais plus de temps, je ferais du sport.",
  "Mes enfants vont à l'école près de chez nous.",
];

/** Transcrição sem fornecedor: devolve frases fixas, por ordem, para desenvolver sem chave. */
export class TranscripteurSimule implements Transcripteur {
  readonly nom = "simulação";
  private compteur = 0;

  async transcrire(): Promise<string> {
    const phrase = PHRASES[this.compteur % PHRASES.length] ?? "";
    this.compteur += 1;
    return phrase;
  }
}
