import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@garona/shared";

const { width } = Dimensions.get("window");

type Slide = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    id: "1",
    icon: "water-outline",
    title: "Garona",
    subtitle: "Le réseau de Toulouse",
    description: "Un réseau social local, fait par et pour les Toulousains. Pas d'algorithme, pas de pub. Juste ta ville.",
  },
  {
    id: "2",
    icon: "people-outline",
    title: "Ici, on se connaît",
    subtitle: "Système de confiance par parrainage",
    description:
      "Pour rejoindre Garona, quelqu'un doit te parrainer. Chaque parrainage est un gage de confiance. Plus on te fait confiance, plus tu peux faire.",
  },
  {
    id: "3",
    icon: "shield-checkmark-outline",
    title: "Les paliers",
    subtitle: "Débloque des actions avec la confiance",
    description:
      "👀 Observer — Voir le fil\n🏠 Voisin — Créer un profil\n📸 Habitant — Poster, commenter\n💬 Toulousain — Stories, messages\n⭐ Ambassadeur — Inviter, organiser\n🏛 Capitoul — Modérer",
  },
  {
    id: "4",
    icon: "qr-code-outline",
    title: "Prêt ?",
    subtitle: "Scanne une invitation pour commencer",
    description: "Demande à un ami toulousain de t'envoyer un lien ou un QR code d'invitation. C'est tout ce qu'il faut.",
  },
];

type Props = {
  onFinish: () => void;
};

export function OnboardingCarousel({ onFinish }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const goNext = () => {
    if (activeIndex === SLIDES.length - 1) {
      onFinish();
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={64} color={colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottom}>
        {activeIndex < SLIDES.length - 1 ? (
          <>
            <Pressable onPress={onFinish}>
              <Text style={styles.skipText}>Passer</Text>
            </Pressable>
            <Pressable style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextText}>Suivant</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          </>
        ) : (
          <Pressable style={[styles.nextBtn, styles.startBtn]} onPress={onFinish}>
            <Ionicons name="qr-code-outline" size={20} color="#fff" />
            <Text style={styles.nextText}>Scanner une invitation</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startBtn: {
    flex: 1,
    justifyContent: "center",
  },
  nextText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
