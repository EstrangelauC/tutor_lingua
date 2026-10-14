import { Tabs } from "expo-router/js-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconeAccueil, IconeHistorique, IconeReglages } from "../../components/icones";
import { styleDirection, useI18n } from "../../i18n";
import { useLarge, useTheme } from "../../theme";

export default function Onglets() {
  const { couleurs } = useTheme();
  const { t, rtl } = useI18n();
  const insets = useSafeAreaInsets();
  // Em ecrãs largos a navegação vai para o topo, com a legenda ao lado do ícone.
  const large = useLarge();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: couleurs.fond },
        tabBarActiveTintColor: couleurs.bleu,
        tabBarInactiveTintColor: couleurs.encre2,
        // Altura explícita: a de omissão (49 px) não chega para ícone + legenda de 12 px.
        tabBarPosition: large ? "top" : "bottom",
        tabBarLabelPosition: large ? "beside-icon" : "below-icon",
        tabBarStyle: [
          large
            ? { height: 56 + insets.top, borderBottomColor: couleurs.ligne }
            : { height: 60 + insets.bottom, paddingTop: 6, borderTopColor: couleurs.ligne },
          { backgroundColor: couleurs.surface },
          styleDirection(rtl),
        ],
        tabBarLabelStyle: { fontSize: large ? 15 : 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.onglets.accueil,
          tabBarIcon: ({ color, size }) => <IconeAccueil couleur={color} taille={size} />,
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: t.onglets.historique,
          tabBarIcon: ({ color, size }) => <IconeHistorique couleur={color} taille={size} />,
        }}
      />
      <Tabs.Screen
        name="definitions"
        options={{
          title: t.onglets.definitions,
          tabBarIcon: ({ color, size }) => <IconeReglages couleur={color} taille={size} />,
        }}
      />
    </Tabs>
  );
}
