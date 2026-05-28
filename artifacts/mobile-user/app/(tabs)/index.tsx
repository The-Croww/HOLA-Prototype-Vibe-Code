import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import {
  useGetMe,
  useGetDailyAffirmation,
  useGetTodayMood,
  useCreateMoodEntry,
} from "@workspace/api-client-react";

const QUICK_MOOD = [
  { score: 2, emoji: "😞", label: "Rough" },
  { score: 4, emoji: "😕", label: "Low" },
  { score: 5, emoji: "😐", label: "Okay" },
  { score: 7, emoji: "🙂", label: "Good" },
  { score: 9, emoji: "😊", label: "Great" },
];

const QUICK_ACTIONS = [
  { label: "Journal", icon: "book-open" as const, color: "#5B9CF6", route: "/journal" as const },
  { label: "Breathe", icon: "wind" as const, color: "#3DD68C", route: "/(tabs)/mindfulness" as const, tab: "breathe" },
  { label: "Chat", icon: "message-circle" as const, color: "#FFB547", route: "/(tabs)/chat" as const },
  { label: "Meditate", icon: "headphones" as const, color: "#C084FC", route: "/(tabs)/mindfulness" as const, tab: "meditate" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user: localUser } = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const { data: me } = useGetMe({ query: { enabled: true } });
  const { data: affirmation } = useGetDailyAffirmation({ query: { enabled: true } });
  const { data: todayMood } = useGetTodayMood({ query: { enabled: true } });

  const { mutate: logMood } = useCreateMoodEntry({
    mutation: {
      onSuccess: () => {
        router.push("/(tabs)/mood");
      },
    },
  });

  const displayName = me?.name ?? localUser?.name ?? "Friend";
  const hasTodayMood = todayMood?.entry != null;

  const handleQuickMood = (score: number) => {
    logMood({ data: { moodScore: score, emotions: [] } });
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
          {greeting},
        </Text>
        <Text style={[styles.name, { color: colors.foreground }]}>
          {displayName} 👋
        </Text>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: hasTodayMood ? 0.5 : 1,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          {hasTodayMood ? "Today's mood logged" : "How are you feeling?"}
        </Text>
        {hasTodayMood ? (
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
            You logged a {todayMood.entry!.moodScore}/10 today.{" "}
            <Text
              style={{ color: colors.calm }}
              onPress={() => router.push("/(tabs)/mood")}
            >
              View details
            </Text>
          </Text>
        ) : (
          <View style={styles.moodStrip}>
            {QUICK_MOOD.map((item) => (
              <TouchableOpacity
                key={item.score}
                style={styles.moodBtn}
                onPress={() => handleQuickMood(item.score)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{item.emoji}</Text>
                <Text style={[styles.moodLabel, { color: colors.mutedForeground }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {affirmation && (
        <View
          style={[
            styles.affirmationCard,
            { backgroundColor: "#000", borderColor: colors.border },
          ]}
        >
          <View style={styles.affirmationHeader}>
            <Feather name="sun" size={14} color="#3DD68C" />
            <Text style={[styles.affirmationLabel, { color: "#3DD68C" }]}>
              Daily affirmation
            </Text>
          </View>
          <Text style={styles.affirmationText}>"{affirmation.text}"</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Quick access
        </Text>
        <View style={styles.grid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[
                styles.gridItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
              onPress={() => {
                if ("tab" in action && action.tab) {
                  router.push({ pathname: action.route, params: { tab: action.tab } } as never);
                } else {
                  router.push(action.route as never);
                }
              }}
            >
              <View style={[styles.gridIcon, { backgroundColor: action.color + "22" }]}>
                <Feather name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={[styles.gridLabel, { color: colors.foreground }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 20,
  },
  header: {
    gap: 2,
  },
  greeting: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  name: {
    fontSize: 26,
    fontFamily: "Inter_600SemiBold",
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  cardSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  moodStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  moodBtn: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  affirmationCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  affirmationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  affirmationLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  affirmationText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    lineHeight: 26,
    fontStyle: "italic",
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: "47%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  gridIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gridLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
