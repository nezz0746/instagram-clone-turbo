import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@garona/shared";
import { Avatar } from "@garona/ui";
import { useProfile } from "../../hooks/useProfile";
import { PalierBadge } from "../../components/PalierBadge";
import { VouchButton } from "../../components/VouchButton";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statVal}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const insets = useSafeAreaInsets();
  const { profile, loading, toggleFollow } = useProfile(username);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Utilisateur introuvable</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerName}>{profile.username}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Profile info */}
      <View style={styles.profileRow}>
        <Avatar uri={profile.avatarUrl || "https://i.pravatar.cc/150"} size={80} />
        <View style={styles.statsRow}>
          <Stat label="Posts" value={profile.posts} />
          <Stat label="Abonnés" value={profile.followers} />
          <Stat label="Abonnements" value={profile.following} />
        </View>
      </View>

      <View style={styles.bio}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.displayName}>{profile.name}</Text>
          <PalierBadge palier={profile.palier} size="sm" />
        </View>
        {profile.bio && <Text style={styles.bioText}>{profile.bio}</Text>}
      </View>

      {/* Action buttons */}
      {!profile.isMe && (
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.followBtn, profile.isFollowing && styles.followingBtn]}
            onPress={toggleFollow}
          >
            <Text style={[styles.followText, profile.isFollowing && styles.followingText]}>
              {profile.isFollowing ? "Abonné" : "S'abonner"}
            </Text>
          </Pressable>
          <VouchButton userId={profile.id} hasVouched={profile.hasVouched} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  headerName: { fontSize: 18, fontWeight: "700", color: colors.text },
  profileRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, gap: 24 },
  statsRow: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  stat: { alignItems: "center" },
  statVal: { color: colors.text, fontWeight: "700", fontSize: 16 },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  bio: { paddingHorizontal: 16, paddingTop: 12 },
  displayName: { color: colors.text, fontWeight: "600", fontSize: 15 },
  bioText: { color: colors.text, fontSize: 13, marginTop: 4 },
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  followBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  followingBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  followingText: { color: colors.text },
  errorText: { color: colors.textMuted, fontSize: 16 },
  backLink: { color: colors.primary, fontSize: 15, marginTop: 12 },
});
