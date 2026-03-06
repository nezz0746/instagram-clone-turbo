import { View, Text, FlatList, StyleSheet, Pressable, Image, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, NOTIFICATIONS, Notification } from "@garona/shared";
import { Avatar } from "@garona/ui";
import { PalierBadge } from "../../components/PalierBadge";
import { useAuth } from "../../lib/auth";
import { useState } from "react";

function NotifRow({ item }: { item: Notification }) {
  return (
    <Pressable style={styles.row}>
      <Avatar uri={item.user.avatar} size={44} />
      <View style={styles.content}>
        <Text style={styles.text}>
          <Text style={styles.bold}>{item.user.username}</Text>
          {item.type === "like" && " a aimé ta publication."}
          {item.type === "follow" && " s'est abonné(e)."}
          {item.type === "comment" && ` a commenté : ${item.text}`}
          <Text style={styles.time}> {item.timeAgo}</Text>
        </Text>
      </View>
      {item.type === "follow" ? (
        <Pressable style={styles.followBtn}>
          <Text style={styles.followText}>Suivre</Text>
        </Pressable>
      ) : item.postImage ? (
        <Image source={{ uri: item.postImage }} style={styles.thumb} />
      ) : null}
    </Pressable>
  );
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const palier = user?.palier ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Activité</Text>
        <PalierBadge palier={palier} size="sm" />
      </View>

      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => <NotifRow item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Aucune activité pour le moment</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.primary },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  content: { flex: 1 },
  text: { color: colors.text, fontSize: 13, lineHeight: 18 },
  bold: { fontWeight: "600" },
  time: { color: colors.textMuted },
  followBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  followText: { color: "#ffffff", fontWeight: "600", fontSize: 13 },
  thumb: { width: 44, height: 44, borderRadius: 6 },
  empty: { padding: 60, alignItems: "center", gap: 12 },
  emptyText: { color: colors.textMuted, fontSize: 15 },
});
