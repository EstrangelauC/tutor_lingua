import { Tabs, type Href } from "expo-router";
import { View, Pressable } from "react-native";
import { Text } from "../../components/texte";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  IconeAccueil,
  IconeHistorique,
  IconeReglages,
  IconeSuivant,
} from "../../components/icones";
import { styleDirection, useI18n } from "../../i18n";
import { useLarge, useTheme, ESPACES, RAYONS, creerStyles } from "../../theme";
import { useRouter, usePathname } from "expo-router";
import { useDonnees } from "../../donnees/donnees-context";

/**
 * Sidebar para Desktop
 * Apresenta a navegação lateral com informações contextuais.
 */
function Sidebar({
  activeTab,
  onTabPress,
}: {
  activeTab: string;
  onTabPress: (name: string) => void;
}) {
  const { couleurs } = useTheme();
  const { t, rtl } = useI18n();
  const { preferences } = useDonnees();
  const styles = useSidebarStyles();

  const tabs = [
    { name: "index", label: t.onglets.percurso, icon: IconeAccueil },
    { name: "pratique", label: t.onglets.praticar, icon: IconeSuivant },
    { name: "historique", label: t.onglets.progressao, icon: IconeHistorique },
    { name: "definitions", label: t.onglets.definicoes, icon: IconeReglages },
  ];

  return (
    <View
      nativeID="camille-sidebar"
      style={[styles.container, styleDirection(rtl), rtl && styles.containerRtl]}
    >
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text variante="section" style={{ color: couleurs.navFundo, fontWeight: "800" }}>
              C
            </Text>
          </View>
          <View style={{ gap: 2 }}>
            <Text variante="section" style={{ color: couleurs.navTexto, fontWeight: "800" }}>
              Camille
            </Text>
            <Text variante="meta" style={{ color: couleurs.navMeta }}>
              Oral TCF IRN
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.nav}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.name}
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === tab.name }}
            onPress={() => onTabPress(tab.name)}
            style={({ pressed }) => [
              styles.tab,
              activeTab === tab.name && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
          >
            <tab.icon couleur={couleurs.navTexto} taille={20} />
            <Text
              variante="libelle"
              style={{
                color: activeTab === tab.name ? couleurs.navTexto : couleurs.navMeta,
                fontWeight: activeTab === tab.name ? "700" : "400",
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.goalCard}>
        <Text variante="meta" style={{ color: couleurs.navMeta }}>
          TCF IRN
        </Text>
        <Text variante="section" style={{ color: couleurs.navTexto }}>
          {t.accueil.objectif(preferences.niveau)}
        </Text>
      </View>
    </View>
  );
}

const sidebarStyles = creerStyles((c) => ({
  container: {
    width: 272,
    height: "100%",
    backgroundColor: c.navFundo,
    borderRightWidth: 1,
    borderColor: c.navFundo,
    padding: ESPACES.lg,
    gap: ESPACES.xxl,
  },
  containerRtl: {
    borderRightWidth: 0,
    borderLeftWidth: 1,
  },
  header: {
    paddingTop: ESPACES.md,
    paddingBottom: ESPACES.xl,
    borderBottomWidth: 1,
    borderColor: c.navAtivo,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: ESPACES.md },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: RAYONS.controle,
    backgroundColor: c.navTexto,
    alignItems: "center",
    justifyContent: "center",
  },
  nav: {
    gap: ESPACES.sm,
    flex: 1,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: ESPACES.md,
    padding: ESPACES.lg,
    minHeight: 48,
    borderRadius: RAYONS.petit,
    cursor: "pointer",
  },
  tabActive: {
    backgroundColor: c.navAtivo,
  },
  tabPressed: { opacity: 0.78 },
  goalCard: {
    padding: ESPACES.lg,
    gap: ESPACES.xs,
    borderRadius: RAYONS.carte,
    backgroundColor: c.navAtivo,
  },
}));
const useSidebarStyles = sidebarStyles;

export default function Onglets() {
  const { couleurs } = useTheme();
  const { t, rtl } = useI18n();
  const insets = useSafeAreaInsets();
  const large = useLarge();
  const router = useRouter();
  const pathname = usePathname();

  // Normaliza o pathname para identificar a tab ativa
  const activeTab =
    pathname.endsWith("index") || pathname === "/"
      ? "index"
      : pathname.includes("historique")
        ? "historique"
        : pathname.includes("pratique")
          ? "pratique"
          : "definitions";

  if (large) {
    return (
      <View style={{ flexDirection: "row", flex: 1, backgroundColor: couleurs.fond }}>
        <Sidebar
          activeTab={activeTab}
          onTabPress={(name) =>
            router.push(
              (name === "index"
                ? "/"
                : name === "pratique"
                  ? "/pratique"
                  : name === "historique"
                    ? "/historique"
                    : "/definitions") as Href,
            )
          }
        />
        <View style={{ flex: 1 }}>
          <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
            <Tabs.Screen name="index" options={{ title: t.onglets.percurso }} />
            <Tabs.Screen name="pratique" options={{ title: t.onglets.praticar }} />
            <Tabs.Screen name="historique" options={{ title: t.onglets.progressao }} />
            <Tabs.Screen name="definitions" options={{ title: t.onglets.definicoes }} />
          </Tabs>
        </View>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: couleurs.fond },
        tabBarActiveTintColor: couleurs.bleu,
        tabBarInactiveTintColor: couleurs.encre2,
        tabBarPosition: "bottom",
        tabBarLabelPosition: "below-icon",
        tabBarStyle: [
          { height: 60 + insets.bottom, paddingTop: 6, borderTopColor: couleurs.ligne },
          { backgroundColor: couleurs.surface },
          styleDirection(rtl),
        ],
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarItemStyle: { minHeight: 48 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.onglets.percurso,
          tabBarIcon: ({ color, size }) => <IconeAccueil couleur={color} taille={size} />,
        }}
      />
      <Tabs.Screen
        name="pratique"
        options={{
          title: t.onglets.praticar,
          tabBarIcon: ({ color, size }) => <IconeSuivant couleur={color} taille={size} />,
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: t.onglets.progressao,
          tabBarIcon: ({ color, size }) => <IconeHistorique couleur={color} taille={size} />,
        }}
      />
      <Tabs.Screen
        name="definitions"
        options={{
          title: t.onglets.definicoes,
          tabBarIcon: ({ color, size }) => <IconeReglages couleur={color} taille={size} />,
        }}
      />
    </Tabs>
  );
}
