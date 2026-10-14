import AsyncStorage from "@react-native-async-storage/async-storage";

const CLES = {
  preferences: "camille:preferences:v1",
  historique: "camille:historique:v1",
} as const;

export type CleStockage = keyof typeof CLES;

/** Valor guardado (JSON), ou undefined se não houver ou não se conseguir ler. */
export async function lire(cle: CleStockage): Promise<unknown> {
  try {
    const texte = await AsyncStorage.getItem(CLES[cle]);
    return texte === null ? undefined : JSON.parse(texte);
  } catch {
    return undefined;
  }
}

export async function ecrire(cle: CleStockage, valeur: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(CLES[cle], JSON.stringify(valeur));
  } catch {
    // Sem armazenamento (por exemplo, navegação privada): a app continua, só não se lembra.
  }
}
