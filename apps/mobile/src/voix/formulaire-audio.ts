import { Platform } from "react-native";

/** Monta o FormData com a gravação no campo "audio", como a API espera. */
export async function formulaireAudio(uri: string): Promise<FormData> {
  const formulaire = new FormData();
  if (Platform.OS === "web") {
    // No browser, a gravação é um blob: URL (webm).
    const blob = await (await fetch(uri)).blob();
    const type = blob.type || "audio/webm";
    formulaire.append("audio", blob, type.includes("mp4") ? "resposta.m4a" : "resposta.webm");
  } else {
    // No React Native, o FormData aceita um ficheiro local descrito por { uri, name, type }.
    const fichier = { uri, name: "resposta.m4a", type: "audio/mp4" };
    formulaire.append("audio", fichier as unknown as Blob);
  }
  return formulaire;
}
