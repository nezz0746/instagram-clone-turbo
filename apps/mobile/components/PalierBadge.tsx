import { View, Text, StyleSheet } from "react-native";
import { colors } from "@garona/shared";

const RANG_CONFIG = [
  { emoji: "👀", label: "Visiteur", color: "#9ca3af" },
  { emoji: "🏠", label: "Membre", color: "#60a5fa" },
  { emoji: "📸", label: "Contributeur", color: "#34d399" },
  { emoji: "💬", label: "Résident", color: "#a78bfa" },
  { emoji: "⭐", label: "Notable", color: "#fbbf24" },
  { emoji: "🏛", label: "Gardien", color: colors.primary },
];

type Props = {
  palier: number;
  size?: "sm" | "md" | "lg";
};

export function PalierBadge({ palier, size = "md" }: Props) {
  const config = RANG_CONFIG[palier] || RANG_CONFIG[0];

  return (
    <View style={[styles.badge, styles[size], { borderColor: config.color }]}>
      <Text style={styles[`${size}Emoji`]}>{config.emoji}</Text>
      <Text style={[styles.label, styles[`${size}Label`], { color: config.color }]}>
        Rang {palier} — {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
  },
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  md: { paddingHorizontal: 10, paddingVertical: 4 },
  lg: { paddingHorizontal: 14, paddingVertical: 6 },
  smEmoji: { fontSize: 10 },
  mdEmoji: { fontSize: 13 },
  lgEmoji: { fontSize: 16 },
  label: { fontWeight: "600" },
  smLabel: { fontSize: 10 },
  mdLabel: { fontSize: 12 },
  lgLabel: { fontSize: 14 },
});
