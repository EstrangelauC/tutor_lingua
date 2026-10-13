import type { Niveau } from "@camille/shared";
import { StyleSheet, Text, View } from "react-native";

const NIVEAUX: readonly Niveau[] = ["A2", "B1", "B2"];

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camille</Text>
      <Text style={styles.subtitle}>Oral TCF IRN · {NIVEAUX.join(" · ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F5F6FA",
  },
  title: {
    fontSize: 40,
    fontWeight: "600",
    color: "#2747C4",
  },
  subtitle: {
    fontSize: 16,
    color: "#4A5170",
  },
});
