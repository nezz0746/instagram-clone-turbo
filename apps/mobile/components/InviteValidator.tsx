import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@garona/shared";
import { API_URL } from "../lib/auth";

type Props = {
  code: string;
  onAccept: (code: string) => void;
  onBack: () => void;
};

type InviteInfo = {
  valid: boolean;
  creator: { name: string; username: string; avatarUrl: string } | null;
  expiresAt: string;
  error?: string;
};

export function InviteValidator({ code, onAccept, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteInfo | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/vouches/invite/${code}`)
      .then((r) => r.json())
      .then((data) => {
        setInvite(data);
        setLoading(false);
      })
      .catch(() => {
        setInvite({ valid: false, creator: null, expiresAt: "", error: "Network error" });
        setLoading(false);
      });
  }, [code]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Vérification de l'invitation...</Text>
      </View>
    );
  }

  if (!invite?.valid) {
    return (
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="close-circle-outline" size={64} color="#ef4444" />
        </View>
        <Text style={styles.title}>Invitation invalide</Text>
        <Text style={styles.desc}>
          {invite?.error === "Already used" && "Cette invitation a déjà été utilisée."}
          {invite?.error === "Expired" && "Cette invitation a expiré."}
          {invite?.error === "Invalid code" && "Ce code d'invitation n'existe pas."}
          {!invite?.error && "Impossible de vérifier cette invitation."}
        </Text>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="checkmark-circle-outline" size={64} color={colors.primary} />
      </View>

      <Text style={styles.title}>Tu es invité !</Text>

      {invite.creator && (
        <View style={styles.creatorCard}>
          <Image source={{ uri: invite.creator.avatarUrl }} style={styles.avatar} />
          <View>
            <Text style={styles.creatorName}>{invite.creator.name}</Text>
            <Text style={styles.creatorUsername}>@{invite.creator.username} t'invite sur Garona</Text>
          </View>
        </View>
      )}

      <Text style={styles.desc}>
        En rejoignant, tu commences en tant qu'Observateur. Demande à tes connaissances de te parrainer pour débloquer plus de fonctionnalités.
      </Text>

      <Pressable style={styles.acceptBtn} onPress={() => onAccept(code)}>
        <Ionicons name="log-in-outline" size={20} color="#fff" />
        <Text style={styles.acceptText}>Rejoindre Garona</Text>
      </Pressable>

      <Pressable onPress={onBack}>
        <Text style={styles.cancelText}>Annuler</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },
  desc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  creatorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    width: "100%",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  creatorUsername: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    width: "100%",
    justifyContent: "center",
  },
  acceptText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  backBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  backText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 4,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 16,
  },
});
