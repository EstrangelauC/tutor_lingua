import { creerClientCamille } from "@camille/shared";
import Constants from "expo-constants";

/**
 * Endereço da API. Em desenvolvimento, a API corre no mesmo computador que o Metro,
 * na porta 3000: usamos o IP que o Expo Go já usa para descarregar a app.
 * EXPO_PUBLIC_API_URL sobrepõe-se a isto (necessário com `--tunnel`).
 */
function adresseApi(): string {
  const configuree = process.env.EXPO_PUBLIC_API_URL;
  if (configuree) {
    return configuree;
  }
  const hote = Constants.expoConfig?.hostUri?.split(":")[0];
  return `http://${hote ?? "localhost"}:3000`;
}

export const ADRESSE_API = adresseApi();

/** A mesma chave que CAMILLE_API_KEY na API; fica embutida na app, por isso não é um segredo forte. */
export const api = creerClientCamille({
  baseUrl: ADRESSE_API,
  cleApi: process.env.EXPO_PUBLIC_CAMILLE_API_KEY || undefined,
});
