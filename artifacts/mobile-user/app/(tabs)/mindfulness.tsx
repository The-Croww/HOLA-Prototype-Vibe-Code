import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Audio } from "expo-av";

const TOOLS = [
  {
    id: "worry",
    emoji: "📦",
    title: "Worry Box",
    desc: "Lock away anxious thoughts",
    color: "#5B9CF6",
  },
  {
    id: "gratitude",
    emoji: "🫙",
    title: "Gratitude Jar",
    desc: "Collect things you're thankful for",
    color: "#3DD68C",
  },
  {
    id: "reframe",
    emoji: "🔄",
    title: "Thought Reframe",
    desc: "Challenge negative thinking",
    color: "#FFB547",
  },
  {
    id: "grounding",
    emoji: "🌿",
    title: "5-4-3-2-1 Grounding",
    desc: "Anchor yourself to the present",
    color: "#3DD68C",
  },
  {
    id: "selfcompassion",
    emoji: "💛",
    title: "Self-Compassion",
    desc: "Be kind to yourself today",
    color: "#FFB547",
  },
  {
    id: "bodyscan",
    emoji: "🧘",
    title: "Body Scan",
    desc: "Release tension head to toe",
    color: "#5B9CF6",
  },
];

const MEDITATIONS = [
  {
    id: "m1",
    emoji: "🌙",
    title: "Sleep Well",
    duration: "3:00",
    tag: "Sleep",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "m2",
    emoji: "☀️",
    title: "Morning Reset",
    duration: "2:30",
    tag: "Energy",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "m3",
    emoji: "🫁",
    title: "Deep Breathwork",
    duration: "2:00",
    tag: "Anxiety",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "m4",
    emoji: "❤️",
    title: "Self-Love",
    duration: "2:45",
    tag: "Mood",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "m5",
    emoji: "🎯",
    title: "Focus Flow",
    duration: "2:15",
    tag: "Focus",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  {
    id: "m6",
    emoji: "😤",
    title: "Anger Release",
    duration: "2:00",
    tag: "Anger",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
];

type BreathPhase = "ready" | "inhale" | "hold" | "exhale" | "done";
type BreathMode = "478" | "box";

const BREATH_MODES = {
  "478": { label: "4-7-8 Breathing", inhale: 4, hold: 7, exhale: 8, rounds: 4 },
  box: { label: "Box Breathing", inhale: 4, hold: 4, exhale: 4, rounds: 4 },
};

export default function MindfulnessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();

  const [activeTab, setActiveTab] = useState<"breathe" | "meditate" | "tools">(
    tabParam === "meditate" ? "meditate" : tabParam === "tools" ? "tools" : "breathe",
  );

  useEffect(() => {
    if (tabParam === "meditate" || tabParam === "breathe" || tabParam === "tools") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Audio player state
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const stopAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  const playMeditation = async (med: (typeof MEDITATIONS)[0]) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // If same track is playing, stop it
      if (currentTrack === med.id && isPlaying) {
        await stopAudio();
        return;
      }

      // Stop any existing audio
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setIsLoadingAudio(true);
      setCurrentTrack(med.id);
      setIsPlaying(false);

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: med.url },
        { shouldPlay: true, isLooping: true },
      );

      soundRef.current = sound;
      setIsPlaying(true);
      setIsLoadingAudio(false);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error("Audio error:", err);
      setIsLoadingAudio(false);
      setCurrentTrack(null);
    }
  };

  // Cleanup audio on tab change
  useEffect(() => {
    if (activeTab !== "meditate") {
      stopAudio();
    }
  }, [activeTab]);

  // Breathing state
  const [breathMode, setBreathMode] = useState<BreathMode>("478");
  const [phase, setPhase] = useState<BreathPhase>("ready");
  const [countdown, setCountdown] = useState(0);
  const [round, setRound] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState("Tap to begin");
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunning = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      isRunning.current = false;
    };
  }, []);

  const animateCircle = (toScale: number, duration: number) => {
    Animated.timing(scaleAnim, {
      toValue: toScale,
      duration: duration * 1000,
      useNativeDriver: true,
    }).start();
  };

  const runPhase = (
    phaseName: BreathPhase,
    seconds: number,
    label: string,
    scale: number,
    currentRound: number,
    totalRounds: number,
    onDone: () => void,
  ) => {
    if (!isRunning.current) return;
    setPhase(phaseName);
    setPhaseLabel(label);
    setCountdown(seconds);
    animateCircle(scale, seconds);

    let remaining = seconds - 1;
    const tick = () => {
      if (!isRunning.current) return;
      if (remaining <= 0) {
        onDone();
        return;
      }
      setCountdown(remaining);
      remaining--;
      timerRef.current = setTimeout(tick, 1000);
    };
    timerRef.current = setTimeout(tick, 1000);
  };

  const startBreathing = () => {
    if (phase !== "ready" && phase !== "done") {
      isRunning.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      scaleAnim.setValue(1);
      setPhase("ready");
      setPhaseLabel("Tap to begin");
      setRound(0);
      setCountdown(0);
      return;
    }

    const mode = BREATH_MODES[breathMode];
    isRunning.current = true;
    setRound(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const doRound = (r: number) => {
      if (!isRunning.current) return;
      if (r > mode.rounds) {
        isRunning.current = false;
        setPhase("done");
        setPhaseLabel("Well done 🎉");
        setCountdown(0);
        animateCircle(1, 0.5);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }
      setRound(r);
      runPhase("inhale", mode.inhale, "Inhale", 1.4, r, mode.rounds, () => {
        runPhase("hold", mode.hold, "Hold", 1.4, r, mode.rounds, () => {
          runPhase("exhale", mode.exhale, "Exhale", 1, r, mode.rounds, () => {
            doRound(r + 1);
          });
        });
      });
    };

    doRound(1);
  };

  const phaseColor = () => {
    if (phase === "inhale") return colors.calm;
    if (phase === "hold") return colors.info;
    if (phase === "exhale") return colors.warning;
    if (phase === "done") return colors.calm;
    return colors.mutedForeground;
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    scrollContent: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 120,
      gap: 16,
    },
    heading: {
      fontSize: 26,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 4,
      gap: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 9,
      alignItems: "center",
    },
    tabActive: { backgroundColor: colors.foreground },
    tabText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    tabTextActive: { color: colors.background },
    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 16,
      gap: 14,
    },
    cardTitle: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    cardDesc: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    modeRow: { flexDirection: "row", gap: 8 },
    modeBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
    },
    modeBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
    circleWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
    },
    circleOuter: {
      width: 180,
      height: 180,
      borderRadius: 90,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    circleInner: {
      width: 140,
      height: 140,
      borderRadius: 70,
      alignItems: "center",
      justifyContent: "center",
    },
    phaseLabel: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      textAlign: "center",
    },
    countdownText: {
      fontSize: 32,
      fontFamily: "Inter_600SemiBold",
      textAlign: "center",
      marginTop: 2,
    },
    roundText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 4,
    },
    startBtn: {
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      backgroundColor: colors.primary,
    },
    startBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.primaryForeground,
    },
    stopBtn: {
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    stopBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    meditationGrid: { gap: 10 },
    meditationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    meditationEmoji: { fontSize: 28 },
    meditationInfo: { flex: 1 },
    meditationTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    meditationDuration: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    meditationTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.secondary,
    },
    meditationTagText: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    toolsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    toolCard: {
      width: "47%",
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: 8,
    },
    toolEmoji: { fontSize: 26 },
    toolTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    toolDesc: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 17,
    },
    comingSoonBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: colors.secondary,
      marginTop: 2,
    },
    comingSoonText: {
      fontSize: 10,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    sectionTitle: {
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Mindfulness</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(["breathe", "meditate", "tools"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && styles.tabActive]}
              onPress={() => {
                setActiveTab(t);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === t && styles.tabTextActive,
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BREATHE TAB */}
        {activeTab === "breathe" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Choose a technique</Text>
              <View style={styles.modeRow}>
                {(["478", "box"] as BreathMode[]).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.modeBtn,
                      {
                        backgroundColor:
                          breathMode === m
                            ? colors.foreground
                            : colors.secondary,
                        borderColor:
                          breathMode === m ? colors.foreground : colors.border,
                      },
                    ]}
                    onPress={() => {
                      if (phase === "ready" || phase === "done") {
                        setBreathMode(m);
                        Haptics.selectionAsync();
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.modeBtnText,
                        {
                          color:
                            breathMode === m
                              ? colors.background
                              : colors.mutedForeground,
                        },
                      ]}
                    >
                      {BREATH_MODES[m].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.cardDesc}>
                {breathMode === "478"
                  ? "Inhale for 4 seconds, hold for 7, exhale for 8. Calms the nervous system fast."
                  : "Equal 4-second intervals for inhale, hold, exhale, hold. Reduces stress and improves focus."}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.circleWrap}>
                <View style={styles.circleOuter}>
                  <Animated.View
                    style={[
                      styles.circleInner,
                      {
                        backgroundColor: phaseColor() + "22",
                        borderWidth: 2,
                        borderColor: phaseColor(),
                        transform: [{ scale: scaleAnim }],
                      },
                    ]}
                  >
                    <Text style={[styles.phaseLabel, { color: phaseColor() }]}>
                      {phaseLabel}
                    </Text>
                    {countdown > 0 && (
                      <Text
                        style={[styles.countdownText, { color: phaseColor() }]}
                      >
                        {countdown}
                      </Text>
                    )}
                  </Animated.View>
                </View>
                {phase !== "ready" && phase !== "done" && (
                  <Text style={styles.roundText}>
                    Round {round} of {BREATH_MODES[breathMode].rounds}
                  </Text>
                )}
              </View>

              {phase === "ready" || phase === "done" ? (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={startBreathing}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startBtnText}>
                    {phase === "done" ? "Start again" : "Begin exercise"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.stopBtn}
                  onPress={startBreathing}
                  activeOpacity={0.8}
                >
                  <Text style={styles.stopBtnText}>Stop</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* MEDITATE TAB */}
        {activeTab === "meditate" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Guided meditations</Text>
            <Text style={styles.cardDesc}>
              Tap any session to play calming audio. Use headphones for the best
              experience.
            </Text>
            <View style={styles.meditationGrid}>
              {MEDITATIONS.map((med) => {
                const isActive = currentTrack === med.id;
                return (
                  <TouchableOpacity
                    key={med.id}
                    style={[
                      styles.meditationRow,
                      isActive && {
                        borderColor: colors.calm,
                        backgroundColor: colors.calm + "11",
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => playMeditation(med)}
                  >
                    <Text style={styles.meditationEmoji}>{med.emoji}</Text>
                    <View style={styles.meditationInfo}>
                      <Text
                        style={[
                          styles.meditationTitle,
                          isActive && { color: colors.calm },
                        ]}
                      >
                        {med.title}
                      </Text>
                      <Text style={styles.meditationDuration}>
                        {med.duration}
                      </Text>
                    </View>
                    <View style={styles.meditationTag}>
                      <Text style={styles.meditationTagText}>{med.tag}</Text>
                    </View>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: isActive
                          ? colors.calm
                          : colors.secondary,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: isActive ? colors.calm : colors.border,
                      }}
                    >
                      {isLoadingAudio && isActive ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={{ fontSize: 12 }}>
                          {isActive && isPlaying ? "⏸" : "▶︎"}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {currentTrack && (
              <TouchableOpacity
                style={[
                  styles.stopBtn,
                  { borderColor: colors.alert + "44", marginTop: 4 },
                ]}
                onPress={stopAudio}
                activeOpacity={0.8}
              >
                <Text style={[styles.stopBtnText, { color: colors.alert }]}>
                  Stop audio
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* TOOLS TAB */}
        {activeTab === "tools" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>CBT & DBT toolkit</Text>
              <Text style={styles.cardDesc}>
                Evidence-based tools to help you manage emotions, challenge
                unhelpful thoughts, and build resilience.
              </Text>
            </View>
            <View style={styles.toolsGrid}>
              {TOOLS.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  style={styles.toolCard}
                  activeOpacity={0.7}
                  onPress={() => Haptics.selectionAsync()}
                >
                  <Text style={styles.toolEmoji}>{tool.emoji}</Text>
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                  <Text style={styles.toolDesc}>{tool.desc}</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>coming soon</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
