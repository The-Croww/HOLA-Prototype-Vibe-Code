import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

const STORAGE_KEY = "@hola_journal_entries";

const MOOD_TAGS = [
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "calm", emoji: "😌", label: "Calm" },
  { id: "anxious", emoji: "😰", label: "Anxious" },
  { id: "sad", emoji: "😢", label: "Sad" },
  { id: "angry", emoji: "😤", label: "Angry" },
  { id: "grateful", emoji: "🙏", label: "Grateful" },
  { id: "tired", emoji: "😴", label: "Tired" },
  { id: "excited", emoji: "🤩", label: "Excited" },
];

interface JournalEntry {
  id: string;
  title: string;
  body: string;
  mood: string | null;
  createdAt: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [mode, setMode] = useState<"list" | "compose" | "view">("list");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Compose state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const bodyRef = useRef<TextInput>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  };

  const saveEntries = async (updated: JournalEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const openCompose = () => {
    setTitle("");
    setBody("");
    setSelectedMood(null);
    setSelectedEntry(null);
    setMode("compose");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setMode("view");
  };

  const saveEntry = () => {
    if (!body.trim() && !title.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: title.trim() || "Untitled",
      body: body.trim(),
      mood: selectedMood,
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setMode("list");
  };

  const deleteEntry = (id: string) => {
    if (Platform.OS === "web") {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      saveEntries(updated);
      setMode("list");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updated = entries.filter((e) => e.id !== id);
            setEntries(updated);
            saveEntries(updated);
            setMode("list");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]);
    }
  };

  const moodTag = MOOD_TAGS.find((m) => m.id === selectedMood);
  const entryMoodTag = MOOD_TAGS.find((m) => m.id === selectedEntry?.mood);

  // GROUP ENTRIES BY DATE LABEL
  const grouped: Record<string, JournalEntry[]> = {};
  for (const e of entries) {
    const label = formatDate(e.createdAt);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(e);
  }
  const groups = Object.entries(grouped);

  // ── VIEW ENTRY ──
  if (mode === "view" && selectedEntry) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setMode("list")} style={styles.headerBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Entry</Text>
          <TouchableOpacity
            onPress={() => deleteEntry(selectedEntry.id)}
            style={styles.headerBtn}
          >
            <Feather name="trash-2" size={20} color={colors.alert} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24, paddingBottom: bottomPad + 40, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 6 }}>
            <Text style={[styles.entryViewDate, { color: colors.mutedForeground }]}>
              {formatDate(selectedEntry.createdAt)} · {formatTime(selectedEntry.createdAt)}
            </Text>
            {entryMoodTag && (
              <View style={[styles.moodPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={styles.moodPillEmoji}>{entryMoodTag.emoji}</Text>
                <Text style={[styles.moodPillLabel, { color: colors.foreground }]}>
                  {entryMoodTag.label}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.entryViewTitle, { color: colors.foreground }]}>
            {selectedEntry.title}
          </Text>
          <Text style={[styles.entryViewBody, { color: colors.foreground }]}>
            {selectedEntry.body}
          </Text>
        </ScrollView>
      </View>
    );
  }

  // ── COMPOSE ENTRY ──
  if (mode === "compose") {
    return (
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setMode("list")} style={styles.headerBtn}>
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Entry</Text>
          <TouchableOpacity
            onPress={saveEntry}
            disabled={!body.trim() && !title.trim()}
            style={[
              styles.saveBtn,
              { backgroundColor: body.trim() || title.trim() ? colors.calm : colors.muted },
            ]}
          >
            <Text
              style={[
                styles.saveBtnText,
                { color: body.trim() || title.trim() ? "#000" : colors.mutedForeground },
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad + 40, gap: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]}
            placeholder="Title (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            onSubmitEditing={() => bodyRef.current?.focus()}
            maxLength={100}
          />

          <TextInput
            ref={bodyRef}
            style={[styles.bodyInput, { color: colors.foreground }]}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.mutedForeground}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
            autoFocus
          />

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>How are you feeling?</Text>
          <View style={styles.moodGrid}>
            {MOOD_TAGS.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => {
                  setSelectedMood(selectedMood === m.id ? null : m.id);
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.moodChip,
                  {
                    backgroundColor:
                      selectedMood === m.id ? colors.calm + "22" : colors.card,
                    borderColor:
                      selectedMood === m.id ? colors.calm : colors.border,
                  },
                ]}
              >
                <Text style={styles.moodChipEmoji}>{m.emoji}</Text>
                <Text
                  style={[
                    styles.moodChipLabel,
                    { color: selectedMood === m.id ? colors.calm : colors.foreground },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── LIST ──
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Journal</Text>
        <TouchableOpacity onPress={openCompose} style={styles.headerBtn}>
          <Feather name="edit-2" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📓</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No entries yet</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Your thoughts, feelings, and reflections — all in one place.
          </Text>
          <TouchableOpacity
            onPress={openCompose}
            style={[styles.emptyBtn, { backgroundColor: colors.calm }]}
          >
            <Feather name="edit-2" size={16} color="#000" />
            <Text style={styles.emptyBtnText}>Write your first entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad + 100, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {groups.map(([dateLabel, dayEntries]) => (
            <View key={dateLabel} style={{ gap: 10 }}>
              <Text style={[styles.dateGroup, { color: colors.mutedForeground }]}>{dateLabel}</Text>
              {dayEntries.map((entry) => {
                const tag = MOOD_TAGS.find((m) => m.id === entry.mood);
                return (
                  <TouchableOpacity
                    key={entry.id}
                    onPress={() => openEntry(entry)}
                    style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    activeOpacity={0.75}
                  >
                    <View style={styles.entryCardTop}>
                      <Text style={[styles.entryTitle, { color: colors.foreground }]} numberOfLines={1}>
                        {entry.title}
                      </Text>
                      <Text style={[styles.entryTime, { color: colors.mutedForeground }]}>
                        {formatTime(entry.createdAt)}
                      </Text>
                    </View>
                    {entry.body ? (
                      <Text style={[styles.entryPreview, { color: colors.mutedForeground }]} numberOfLines={2}>
                        {entry.body}
                      </Text>
                    ) : null}
                    {tag && (
                      <View style={[styles.moodPill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={styles.moodPillEmoji}>{tag.emoji}</Text>
                        <Text style={[styles.moodPillLabel, { color: colors.mutedForeground }]}>
                          {tag.label}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={openCompose}
        style={[styles.fab, { backgroundColor: colors.calm, bottom: bottomPad + 100 }]}
      >
        <Feather name="plus" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  emptyBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
  },
  dateGroup: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  entryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  entryCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  entryTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  entryTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flexShrink: 0,
  },
  entryPreview: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  moodPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  moodPillEmoji: {
    fontSize: 13,
  },
  moodPillLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  // Compose
  titleInput: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  bodyInput: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    minHeight: 180,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  moodChipEmoji: {
    fontSize: 15,
  },
  moodChipLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  // View
  entryViewDate: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  entryViewTitle: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 30,
  },
  entryViewBody: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
  },
});
