import { Platform } from "react-native";

export { PALETTES, type Couleurs, type NomTheme } from "./palettes";
export { TOUCHE_MIN } from "./tokens";

/** Serifa reservada ao francês; a interface usa a fonte de sistema e os seus fallbacks. */
export const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, 'Times New Roman', serif",
});
