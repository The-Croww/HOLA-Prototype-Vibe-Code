import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useGetMe } from "@workspace/api-client-react";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user: localUser, signOut } = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const { data: me } = useGetMe({ query: { enabled: true } });
  const displayName = me?.name ?? localUser?.name ?? "Friend";
  const displayEmail = me?.email ?? localUser?.email ?? "";

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  const ROW_ITEMS = [
    { icon: "bell" as const, label: "Notifications" },
    { icon: "shield" as const, label: "Privacy & data sharing" },
    { icon: "moon" as const, label: "Appearance" },
    { icon: "help-circle" as const, label: "Help & support" },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPad + 16,
          paddingBottom: bottomPad + 100,
        },
      ]}
    >
      <Text style={[styles.heading, { color: colors.foreground }]}>Profile</Text>

      <View style={[styles.avatarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={[styles.name, { color: colors.foreground }]}>{displayName}</Text>
          <Text style={[styles.email, { color: colors.mutedForeground }]}>{displayEmail}</Text>
        </View>
      </View>

      <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {ROW_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.listRow,
              index < ROW_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.listRowLeft}>
              <Feather name={item.icon} size={18} color={colors.mutedForeground} />
              <Text style={[styles.listLabel, { color: colors.foreground }]}>{item.label}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.signOutBtn, { borderColor: colors.alert }]}
        onPress={handleSignOut}
        activeOpacity={0.7}
      >
        <Feather name="log-out" size={16} color={colors.alert} />
        <Text style={[styles.signOutText, { color: colors.alert }]}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  heading: {
    fontSize: 26,
    fontFamily: "Inter_600SemiBold",
  },
  avatarCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
  },
  name: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  email: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  listCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
