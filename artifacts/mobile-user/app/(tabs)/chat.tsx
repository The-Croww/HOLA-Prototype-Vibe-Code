import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_REPLIES = [
  "I'm feeling anxious 😰",
  "I need to vent",
  "Guide me through breathing",
  "I'm feeling low today",
  "Celebrate a small win 🎉",
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey there 👋 I'm HOLA Buddy, your personal wellness companion. How are you feeling right now? You can talk to me about anything — I'm here to listen and support you.",
  timestamp: new Date(),
};

function TypingIndicator({ colors }: { colors: ReturnType<typeof useColors> }) {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(450 - i * 150),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.typingDots}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: colors.mutedForeground, transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatScreen() {
  const colors = useColors();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        const history = [...messages, userMsg]
          .filter((m) => !(m.id === "welcome" && m.role === "assistant"))
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch(
          `https://${process.env.EXPO_PUBLIC_DOMAIN}/api/v1/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ messages: history }),
          }
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.error ?? "API error");

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              data.message?.content ??
              data.choices?.[0]?.message?.content ??
              "I'm here with you. Could you tell me more?",
            timestamp: new Date(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "Sorry, I had trouble connecting. Please check your internet and try again 💙",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [messages, isTyping, token]
  );

  const showQuickReplies =
    !isTyping &&
    messages[messages.length - 1]?.role === "assistant" &&
    messages.length <= 2;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { backgroundColor: colors.calm }]}>
            <Text style={styles.avatarText}>🌿</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerName, { color: colors.foreground }]}>
              HOLA Buddy
            </Text>
            <View style={styles.onlineRow}>
              <View style={[styles.onlineDot, { backgroundColor: colors.calm }]} />
              <Text style={[styles.headerStatus, { color: colors.calm }]}>
                Always here for you
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubbleWrapper,
              item.role === "user"
                ? styles.bubbleWrapperUser
                : styles.bubbleWrapperAssistant,
            ]}
          >
            <View
              style={[
                styles.bubble,
                item.role === "user"
                  ? [styles.bubbleUser, { backgroundColor: colors.foreground }]
                  : [styles.bubbleAssistant, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  { color: item.role === "user" ? colors.background : colors.foreground },
                ]}
              >
                {item.content}
              </Text>
            </View>
            <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        )}
        ListFooterComponent={
          isTyping ? (
            <View style={{ marginTop: 4, alignSelf: "flex-start" }}>
              <TypingIndicator colors={colors} />
            </View>
          ) : null
        }
      />

      {/* Quick replies */}
      {showQuickReplies && (
        <View
          style={[
            styles.quickRepliesContainer,
            { borderTopColor: colors.border },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRepliesScroll}
          >
            {QUICK_REPLIES.map((qr) => (
              <TouchableOpacity
                key={qr}
                style={[
                  styles.quickReply,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
                onPress={() => sendMessage(qr)}
                activeOpacity={0.7}
              >
                <Text style={[styles.quickReplyText, { color: colors.foreground }]}>
                  {qr}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input */}
      <View
        style={[
          styles.inputRow,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + 10,
          },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground,
            },
          ]}
          placeholder="Talk to HOLA Buddy..."
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={() => sendMessage(input)}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                input.trim() && !isTyping ? colors.foreground : colors.border,
            },
          ]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || isTyping}
          activeOpacity={0.8}
        >
          {isTyping ? (
            <ActivityIndicator size="small" color={colors.mutedForeground} />
          ) : (
            <Feather
              name="arrow-up"
              size={18}
              color={input.trim() ? colors.background : colors.mutedForeground}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18 },
  headerName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerStatus: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  messageList: { flex: 1 },
  messageListContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  bubbleWrapper: { maxWidth: "80%" },
  bubbleWrapperUser: { alignSelf: "flex-end", alignItems: "flex-end" },
  bubbleWrapperAssistant: { alignSelf: "flex-start", alignItems: "flex-start" },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleAssistant: {
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    marginHorizontal: 4,
  },
  typingBubble: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 0.5,
  },
  typingDots: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  quickRepliesContainer: {
    paddingVertical: 10,
    borderTopWidth: 0.5,
  },
  quickRepliesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickReply: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 0.5,
  },
  quickReplyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 0.5,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    borderWidth: 0.5,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
