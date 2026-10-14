/** Áudio recebido da app, já em memória. */
export interface AudioEleve {
  contenu: Buffer;
  typeMime: string;
  nomFichier: string;
}

export interface Transcripteur {
  readonly nom: string;
  /** Texto dito pelo aluno, em francês, sem correções. String vazia se não se percebeu nada. */
  transcrire(audio: AudioEleve): Promise<string>;
}

export const TRANSCRIPTEUR = Symbol("TRANSCRIPTEUR");
