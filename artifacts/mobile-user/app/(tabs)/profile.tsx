import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useGetMe, useGetMoodEntries } from "@workspace/api-client-react";

const JOURNAL_STORAGE_KEY = "@hola_journal_entries";

function calcStreak(entries: { createdAt: string }[]): number {
  if (entries.length === 0) return 0;
  const days = new Set(entries.map((e) => new Date(e.createdAt).toDateString()));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) streak++;
    else break;
  }
  return streak;
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { user: localUser, signOut } = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [shareData, setShareData] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [journalCount, setJournalCount] = useState(0);

  const { data: me } = useGetMe();
  const { data: moodData } = useGetMoodEntries({ limit: 100 });

  useEffect(() => {
    AsyncStorage.getItem(JOURNAL_STORAGE_KEY).then((raw) => {
      if (raw) setJournalCount(JSON.parse(raw).length);
    }).catch(() => {});
  }, []);

  const entries = moodData?.entries ?? [];
  const streak = calcStreak(entries);
  const moodsLogged = entries.length;

  const displayName = me?.name ?? localUser?.name ?? "Friend";
  const displayEmail = me?.email ?? localUser?.email ?? "";
  const memberSince = localUser?.createdAt
    ? new Date(localUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  };

  const handleShareDataToggle = (val: boolean) => {
    if (!val) {
      Alert.alert(
        "Stop sharing data?",
        "Your psychologist will no longer see your mood logs and journal entries.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Stop sharing",
            style: "destructive",
            onPress: () => setShareData(false),
          },
        ],
      );
    } else {
      setShareData(true);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    scrollContent: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: bottomPad + 120,
      gap: 16,
    },
    heading: {
      fontSize: 26,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    avatarCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 999,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 24,
      fontFamily: "Inter_600SemiBold",
      color: colors.primaryForeground,
    },
    nameBlock: { flex: 1 },
    name: {
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    email: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    memberBadge: {
      alignSelf: "flex-start",
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: colors.secondary,
    },
    memberText: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
    },
    statCard: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 14,
      alignItems: "center",
      gap: 4,
    },
    statEmoji: { fontSize: 22 },
    statValue: {
      fontSize: 20,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    sectionLabel: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: -4,
    },
    listCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      overflow: "hidden",
    },
    listRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    listRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    listLabel: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    listSubLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 1,
    },
    psychCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    psychAvatar: {
      width: 44,
      height: 44,
      borderRadius: 999,
      backgroundColor: colors.calm + "22",
      alignItems: "center",
      justifyContent: "center",
    },
    psychInfo: { flex: 1 },
    psychName: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    psychRole: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    psychBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.calm + "22",
    },
    psychBadgeText: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.calm,
    },
    signOutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.alert,
      borderRadius: 8,
      paddingVertical: 14,
    },
    signOutText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.alert,
    },
    versionText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Profile</Text>

        {/* Avatar card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{displayEmail}</Text>
            <View style={styles.memberBadge}>
              <Text style={styles.memberText}>Member since {memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={styles.statValue}>{moodsLogged}</Text>
            <Text style={styles.statLabel}>Moods logged</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📓</Text>
            <Text style={styles.statValue}>{journalCount}</Text>
            <Text style={styles.statLabel}>Journal entries</Text>
          </View>
        </View>

        {/* Linked psychologist */}
        <Text style={styles.sectionLabel}>Your psychologist</Text>
        <View style={styles.psychCard}>
          <View style={styles.psychAvatar}>
            <Text style={{ fontSize: 20 }}>👩‍⚕️</Text>
          </View>
          <View style={styles.psychInfo}>
            <Text style={styles.psychName}>Not linked yet</Text>
            <Text style={styles.psychRole}>
              Ask your psychologist to link your account
            </Text>
          </View>
          <View style={styles.psychBadge}>
            <Text style={styles.psychBadgeText}>Pending</Text>
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.listCard}>
          <View style={[styles.listRow, styles.listRowBorder]}>
            <View style={styles.listRowLeft}>
              <Feather name="bell" size={18} color={colors.mutedForeground} />
              <View>
                <Text style={styles.listLabel}>Notifications</Text>
                <Text style={styles.listSubLabel}>
                  Daily check-in reminders
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.calm }}
              thumbColor={colors.background}
            />
          </View>

          <View style={[styles.listRow, styles.listRowBorder]}>
            <View style={styles.listRowLeft}>
              <Feather
                name="share-2"
                size={18}
                color={colors.mutedForeground}
              />
              <View>
                <Text style={styles.listLabel}>
                  Share data with psychologist
                </Text>
                <Text style={styles.listSubLabel}>
                  Mood logs and journal entries
                </Text>
              </View>
            </View>
            <Switch
              value={shareData}
              onValueChange={handleShareDataToggle}
              trackColor={{ false: colors.border, true: colors.calm }}
              thumbColor={colors.background}
            />
          </View>

          <View style={[styles.listRow, styles.listRowBorder]}>
            <View style={styles.listRowLeft}>
              <Feather name="moon" size={18} color={colors.mutedForeground} />
              <View>
                <Text style={styles.listLabel}>Appearance</Text>
                <Text style={styles.listSubLabel}>
                  {colorScheme === "dark" ? "Dark mode" : "Light mode"} ·
                  follows system
                </Text>
              </View>
            </View>
            <Feather
              name="chevron-right"
              size={16}
              color={colors.mutedForeground}
            />
          </View>

          <View style={styles.listRow}>
            <View style={styles.listRowLeft}>
              <Feather
                name="help-circle"
                size={18}
                color={colors.mutedForeground}
              />
              <Text style={styles.listLabel}>Help & support</Text>
            </View>
            <Feather
              name="chevron-right"
              size={16}
              color={colors.mutedForeground}
            />
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={16} color={colors.alert} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>HOLA! Life Buddy v1.0.0</Text>
      </ScrollView>
    </View>
  );
}
