import { Stack } from "expo-router";
import Head from "expo-router/head";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { I18nManager, Platform } from "react-native";
import { DonneesProvider } from "../donnees/donnees-context";
import { useI18n } from "../i18n";
import { TITRE_DOCUMENT, useTheme } from "../theme";

// A direção (RTL em árabe) segue a língua escolhida na app e aplica-se ecrã a ecrã;
// a do aparelho não deve virar o layout por cima disso.
if (Platform.OS !== "web") {
  I18nManager.allowRTL(false);
}
// O ecrã de arranque fica até as preferências estarem lidas.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <DonneesProvider>
      <Racine />
    </DonneesProvider>
  );
}

function Racine() {
  const { nom, couleurs } = useTheme();
  const { langue, rtl } = useI18n();

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(couleurs.fond);
  }, [couleurs.fond]);

  // Na web, a direção e a língua vêm do <html>: o browser trata do resto (bidi, campos de texto).
  useEffect(() => {
    if (Platform.OS === "web") {
      document.documentElement.lang = langue;
      document.documentElement.dir = rtl ? "rtl" : "ltr";
    }
  }, [langue, rtl]);

  return (
    <>
      {/* Na web, o Expo Router gere o <title> com o Helmet: sem isto fica vazio. */}
      <Head>
        <title>{TITRE_DOCUMENT}</title>
      </Head>
      <StatusBar style={nom === "sombre" ? "light" : "dark"} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: couleurs.fond } }}
      />
    </>
  );
}
