import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function MindfulnessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: topPad + 16 },
      ]}
    >
      <Text style={[styles.heading, { color: colors.foreground }]}>Mindfulness</Text>
      <View style={styles.center}>
        <View style={[styles.iconBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="wind" size={36} color={colors.calm} />
        </View>
        <Text style={[styles.comingSoon, { color: colors.foreground }]}>
          Coming in Phase 2
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Breathing exercises, guided meditations, CBT tools, and journal prompts.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 20,
  },
  heading: {
    fontSize: 26,
    fontFamily: "Inter_600SemiBold",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  comingSoon: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
