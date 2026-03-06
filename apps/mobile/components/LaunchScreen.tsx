import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@garona/shared";

type Props = {
  onSignUp: () => void;
  onSignIn: () => void;
};

export function LaunchScreen({ onSignUp, onSignIn }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Ionicons name="water-outline" size={56} color={colors.primary} />
        </View>
        <Text style={styles.brand}>Garona</Text>
        <Text style={styles.tagline}>Le réseau de Toulouse</Text>
      </View>

      <View style={styles.bottom}>
        <Pressable style={styles.signUpBtn} onPress={onSignUp}>
          <Text style={styles.signUpText}>Créer un compte</Text>
        </Pressable>

        <Pressable style={styles.signInBtn} onPress={onSignIn}>
          <Text style={styles.signInText}>J'ai déjà un compte</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "space-between",
    paddingBottom: 60,
    paddingTop: 120,
  },
  hero: {
    alignItems: "center",
    gap: 12,
  },
  logoWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: "center", alignItems: "center",
    marginBottom: 8,
  },
  brand: {
    fontSize: 42,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: "500",
  },
  bottom: {
    paddingHorizontal: 32,
    gap: 12,
  },
  signUpBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  signUpText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  signInBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  signInText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "700",
  },
});
