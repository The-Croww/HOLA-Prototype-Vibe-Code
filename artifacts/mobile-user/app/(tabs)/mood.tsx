import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import {
  useGetMoodEntries,
  useCreateMoodEntry,
  getGetMoodEntriesQueryKey,
  getGetTodayMoodQueryKey,
} from "@workspace/api-client-react";
import { WeeklyMoodChart } from "@/components/WeeklyMoodChart";

const MOOD_EMOJIS: Record<number, string> = {
  1: "😩", 2: "😞", 3: "😟", 4: "😕", 5: "😐",
  6: "🙂", 7: "😊", 8: "😄", 9: "🤩", 10: "🥳",
};

const MOOD_LABELS: Record<number, string> = {
  1: "Terrible", 2: "Very bad", 3: "Bad", 4: "Low", 5: "Neutral",
  6: "Okay", 7: "Good", 8: "Great", 9: "Amazing", 10: "Incredible",
};

const EMOTION_TAGS = [
  "Anxious", "Calm", "Sad", "Energized", "Angry",
  "Hopeful", "Grateful", "Overwhelmed", "Happy", "Tired",
  "Stressed", "Peaceful", "Lonely", "Excited", "Numb",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getMoodColor(score: number, colors: ReturnType<typeof useColors>) {
  if (score >= 7) return colors.calm;
  if (score >= 4) return colors.warning;
  return colors.alert;
}

export default function MoodTrackerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [selectedScore, setSelectedScore] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const { data: moodData, isLoading } = useGetMoodEntries(
    { limit: 30 },
    { query: { queryKey: getGetMoodEntriesQueryKey({ limit: 30 }) } },
  );

  const { mutate: createEntry, isPending } = useCreateMoodEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMoodEntriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTodayMoodQueryKey() });
        setSelectedEmotions([]);
        setNote("");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Logged!", "Your mood has been saved.");
      },
      onError: () => {
        Alert.alert("Error", "Could not save your mood. Please try again.");
      },
    },
  });

  const toggleEmotion = (tag: string) => {
    Haptics.selectionAsync();
    setSelectedEmotions((prev) =>
      prev.includes(tag) ? prev.filter((e) => e !== tag) : [...prev, tag],
    );
  };

  const handleLog = () => {
    createEntry({ data: { moodScore: selectedScore, emotions: selectedEmotions, note: note.trim() || null } });
  };

  const entries = moodData?.entries ?? [];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const match = entries.find(
      (e) => new Date(e.createdAt).toDateString() === dayStr,
    );
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      score: match ? match.moodScore : null,
    };
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.heading, { color: colors.foreground }]}>Mood Tracker</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          How are you feeling right now?
        </Text>

        <View style={styles.emojiCenter}>
          <Text style={styles.bigEmoji}>{MOOD_EMOJIS[selectedScore]}</Text>
          <Text style={[styles.moodLabel, { color: getMoodColor(selectedScore, colors) }]}>
            {MOOD_LABELS[selectedScore]} — {selectedScore}/10
          </Text>
        </View>

        <View style={styles.scaleRow}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
            <TouchableOpacity
              key={score}
              style={[
                styles.scorePill,
                {
                  backgroundColor:
                    score === selectedScore
                      ? getMoodColor(score, colors)
                      : colors.secondary,
                  borderColor:
                    score === selectedScore
                      ? getMoodColor(score, colors)
                      : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedScore(score);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.scorePillText,
                  {
                    color:
                      score === selectedScore
                        ? "#FFF"
                        : colors.mutedForeground,
                    fontFamily:
                      score === selectedScore
                        ? "Inter_600SemiBold"
                        : "Inter_400Regular",
                  },
                ]}
              >
                {score}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          What emotions are present?
        </Text>
        <View style={styles.tagsWrap}>
          {EMOTION_TAGS.map((tag) => {
            const active = selectedEmotions.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  {
                    backgroundColor: active ? colors.foreground : colors.secondary,
                    borderColor: active ? colors.foreground : colors.border,
                  },
                ]}
                onPress={() => toggleEmotion(tag)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: active ? colors.background : colors.mutedForeground },
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Add a note (optional)
        </Text>
        <TextInput
          style={[
            styles.noteInput,
            { color: colors.foreground, borderColor: colors.border },
          ]}
          placeholder="What's on your mind today..."
          placeholderTextColor={colors.mutedForeground}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.logBtn, { backgroundColor: colors.primary }]}
        onPress={handleLog}
        disabled={isPending}
        activeOpacity={0.8}
      >
        {isPending ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Text style={[styles.logBtnText, { color: colors.primaryForeground }]}>
            Log Mood
          </Text>
        )}
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          This week
        </Text>
        <WeeklyMoodChart data={last7Days} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Recent entries
        </Text>
        {isLoading ? (
          <ActivityIndicator color={colors.calm} />
        ) : entries.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No mood entries yet. Log your first one above!
          </Text>
        ) : (
          entries.slice(0, 10).map((entry) => (
            <View
              key={entry.id}
              style={[
                styles.entryRow,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <View style={styles.entryLeft}>
                <Text style={styles.entryEmoji}>{MOOD_EMOJIS[entry.moodScore]}</Text>
                <View>
                  <Text style={[styles.entryScore, { color: getMoodColor(entry.moodScore, colors) }]}>
                    {entry.moodScore}/10 — {MOOD_LABELS[entry.moodScore]}
                  </Text>
                  <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>
                    {formatDate(entry.createdAt)}
                  </Text>
                  {entry.emotions.length > 0 && (
                    <Text style={[styles.entryEmotions, { color: colors.mutedForeground }]}>
                      {entry.emotions.join(" · ")}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 16,
  },
  heading: {
    fontSize: 26,
    fontFamily: "Inter_600SemiBold",
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  emojiCenter: {
    alignItems: "center",
    gap: 6,
  },
  bigEmoji: {
    fontSize: 52,
  },
  moodLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  scaleRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  scorePill: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scorePillText: {
    fontSize: 13,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
  },
  logBtn: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  logBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 20,
  },
  entryRow: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  entryLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  entryEmoji: {
    fontSize: 28,
    marginTop: 2,
  },
  entryScore: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  entryDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  entryEmotions: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
