import React, { useState, useRef, useCallback } from "react";
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
} from "react-native";
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

export default function ChatScreen() {
  const colors = useColors();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

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

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      try {
        const history = [...messages, userMsg]
          .filter((m) => m.id !== "welcome" || m.role !== "assistant")
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
          },
        );

        const data = await res.json();
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            data.message?.content ??
            "I'm here with you. Could you tell me more?",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
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
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    },
    [messages, isTyping, token],
  );

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top + 8,
      paddingBottom: 14,
      paddingHorizontal: 20,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.calm,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 18,
    },
    headerName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    headerStatus: {
      fontSize: 12,
      color: colors.calm,
      marginTop: 1,
    },
    messageList: {
      flex: 1,
    },
    messageListContent: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    bubbleWrapper: {
      maxWidth: "80%",
    },
    bubbleWrapperUser: {
      alignSelf: "flex-end",
      alignItems: "flex-end",
    },
    bubbleWrapperAssistant: {
      alignSelf: "flex-start",
      alignItems: "flex-start",
    },
    bubble: {
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    bubbleUser: {
      backgroundColor: colors.text,
      borderBottomRightRadius: 4,
    },
    bubbleAssistant: {
      backgroundColor: colors.card,
      borderBottomLeftRadius: 4,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    bubbleTextUser: {
      fontSize: 14,
      color: colors.background,
      lineHeight: 20,
    },
    bubbleTextAssistant: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    timestamp: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 4,
      marginHorizontal: 4,
    },
    typingBubble: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderBottomLeftRadius: 4,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 0.5,
      borderColor: colors.border,
      alignSelf: "flex-start",
    },
    typingDots: {
      flexDirection: "row",
      gap: 4,
      alignItems: "center",
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.mutedForeground,
    },
    quickRepliesContainer: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
    },
    quickRepliesScroll: {
      flexDirection: "row",
      gap: 8,
    },
    quickReply: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 0.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    quickReplyText: {
      fontSize: 13,
      color: colors.text,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: insets.bottom + 10,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    textInput: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: {
      backgroundColor: colors.border,
    },
    sendArrow: {
      fontSize: 18,
      color: colors.background,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🌿</Text>
          </View>
          <View>
            <Text style={styles.headerName}>HOLA Buddy</Text>
            <Text style={styles.headerStatus}>● Always here for you</Text>
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
                  ? styles.bubbleUser
                  : styles.bubbleAssistant,
              ]}
            >
              <Text
                style={
                  item.role === "user"
                    ? styles.bubbleTextUser
                    : styles.bubbleTextAssistant
                }
              >
                {item.content}
              </Text>
            </View>
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          </View>
        )}
        ListFooterComponent={
          isTyping ? (
            <View style={{ marginTop: 4 }}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, { opacity: 0.4 }]} />
                  <View style={[styles.dot, { opacity: 0.7 }]} />
                  <View style={styles.dot} />
                </View>
              </View>
            </View>
          ) : null
        }
      />

      {/* Quick replies — only show when not typing and last message is from assistant */}
      {!isTyping &&
        messages[messages.length - 1]?.role === "assistant" &&
        messages.length <= 2 && (
          <View style={styles.quickRepliesContainer}>
            <View style={styles.quickRepliesScroll}>
              {QUICK_REPLIES.map((qr) => (
                <TouchableOpacity
                  key={qr}
                  style={styles.quickReply}
                  onPress={() => sendMessage(qr)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickReplyText}>{qr}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
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
            (!input.trim() || isTyping) && styles.sendBtnDisabled,
          ]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || isTyping}
          activeOpacity={0.8}
        >
          {isTyping ? (
            <ActivityIndicator size="small" color={colors.mutedForeground} />
          ) : (
            <Text style={styles.sendArrow}>↑</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
