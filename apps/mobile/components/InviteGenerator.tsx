import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Share, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@garona/shared";
import { vouchesApi } from "../lib/api";

type Props = {
  palier: number;
};

export function InviteGenerator({ palier }: Props) {
  const [invite, setInvite] = useState<{ code: string; link: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canInvite = palier >= 4;

  const generateInvite = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await vouchesApi.createInvite();
      setInvite({ code: result.code, link: result.link });
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const shareInvite = async () => {
    if (!invite) return;
    await Share.share({
      message: `Rejoins Garona, le réseau de Toulouse ! 🏛\n\nUtilise ce code : ${invite.code}\n\nOu ouvre ce lien : ${invite.link}`,
    });
  };

  if (!canInvite) {
    return (
      <View style={styles.locked}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
        <Text style={styles.lockedText}>
          Palier 4 (Ambassadeur) requis pour inviter
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!invite ? (
        <Pressable style={styles.generateBtn} onPress={generateInvite} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="qr-code-outline" size={20} color="#fff" />
              <Text style={styles.generateText}>Générer une invitation</Text>
            </>
          )}
        </Pressable>
      ) : (
        <View style={styles.inviteCard}>
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>Code d'invitation</Text>
            <Text style={styles.code}>{invite.code}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.shareBtn} onPress={shareInvite}>
              <Ionicons name="share-outline" size={18} color="#fff" />
              <Text style={styles.shareText}>Partager</Text>
            </Pressable>
            <Pressable style={styles.newBtn} onPress={() => { setInvite(null); generateInvite(); }}>
              <Ionicons name="refresh-outline" size={18} color={colors.primary} />
              <Text style={styles.newText}>Nouveau</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>
            Valable 7 jours • Usage unique
          </Text>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  generateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  inviteCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  codeRow: {
    alignItems: "center",
    gap: 4,
  },
  codeLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  code: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shareText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  newText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  locked: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    margin: 16,
  },
  lockedText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  error: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
  },
});
