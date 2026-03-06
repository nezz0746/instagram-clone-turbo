import { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@garona/shared";
import { FeedPost, profilesApi } from "../../lib/api";
import { FeedPostCard } from "../../components/FeedPostCard";
import { CommentsSheet } from "../../components/CommentsSheet";

export default function UserPostsScreen() {
  const { username, startIndex } = useLocalSearchParams<{ username: string; startIndex?: string }>();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [scrolledOnce, setScrolledOnce] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    profilesApi.postsFeed(username).then(setPosts).catch(() => setPosts([])).finally(() => setLoading(false));
  }, [username]);

  // Scroll to tapped post
  useEffect(() => {
    if (!loading && posts.length > 0 && startIndex && !scrolledOnce) {
      const idx = parseInt(startIndex, 10);
      if (idx > 0 && idx < posts.length) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: idx, animated: false });
        }, 100);
      }
      setScrolledOnce(true);
    }
  }, [loading, posts, startIndex, scrolledOnce]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Publications</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <FeedPostCard
            post={item}
            onLike={() => {}}
            onOpenComments={() => setCommentPostId(item.id)}
          />
        )}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
          }, 200);
        }}
        showsVerticalScrollIndicator={false}
      />

      <CommentsSheet
        postId={commentPostId}
        visible={commentPostId !== null}
        onClose={() => setCommentPostId(null)}
        onCommentAdded={() => {}}
      />
    </View>
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
});
