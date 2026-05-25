import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    image: require("../assets/images/onboarding1.png"),
    title: "Your daily wellness companion",
    subtitle:
      "HOLA! Life Buddy helps you track how you're feeling and build healthier mental habits — one day at a time.",
  },
  {
    id: "2",
    image: require("../assets/images/onboarding2.png"),
    title: "Understand your emotions",
    subtitle:
      "Log your mood daily, spot patterns over time, and gain insights that help you grow.",
  },
  {
    id: "3",
    image: require("../assets/images/onboarding3.png"),
    title: "Never face it alone",
    subtitle:
      "Chat with HOLA Buddy, your AI companion trained in CBT and DBT techniques, whenever you need support.",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.replace("/register");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, paddingTop: topPad + 20 }]}>
            <Image source={item.image} style={styles.illustration} resizeMode="contain" />
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                {item.title}
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {item.subtitle}
              </Text>
            </View>
          </View>
        )}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: bottomPad + 24, backgroundColor: colors.background },
        ]}
      >
        <View style={styles.dots}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === activeIndex ? colors.primary : colors.border,
                  width: index === activeIndex ? 20 : 6,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextBtnText, { color: colors.primaryForeground }]}>
            {activeIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
          </Text>
        </TouchableOpacity>

        {activeIndex === SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => router.replace("/login")} activeOpacity={0.7}>
            <Text style={[styles.loginLink, { color: colors.mutedForeground }]}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  illustration: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 16,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginBottom: 8,
  },
  dot: {
    height: 6,
    borderRadius: 999,
  },
  nextBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  nextBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  loginLink: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
