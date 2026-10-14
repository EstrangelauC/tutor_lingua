import { Tabs } from "expo-router/js-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconeAccueil, IconeHistorique, IconeReglages } from "../../components/icones";
import { styleDirection, useI18n } from "../../i18n";
import { useTheme } from "../../theme";

export default function Onglets() {
  const { couleurs } = useTheme();
  const { t, rtl } = useI18n();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: couleurs.fond },
        tabBarActiveTintColor: couleurs.bleu,
        tabBarInactiveTintColor: couleurs.encre2,
        // Altura explícita: a de omissão (49 px) não chega para ícone + legenda de 12 px.
        tabBarStyle: [
          {
            height: 60 + insets.bottom,
            paddingTop: 6,
            backgroundColor: couleurs.surface,
            borderTopColor: couleurs.ligne,
          },
          styleDirection(rtl),
        ],
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
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
