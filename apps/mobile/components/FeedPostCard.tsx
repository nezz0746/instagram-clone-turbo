import { View, Text, Image, StyleSheet, Dimensions, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@garona/shared";
import { Avatar, IconButton } from "@garona/ui";
import { FeedPost } from "../lib/api";

const MAX_WIDTH = Math.min(Dimensions.get("window").width, 600);

type Props = {
  post: FeedPost;
  onLike: () => void;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}j`;
}

export function FeedPostCard({ post, onLike }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.headerLeft}>
          <Avatar uri={post.author.avatarUrl || "https://i.pravatar.cc/150"} size={32} />
          <Text style={styles.username}>{post.author.username}</Text>
        </Pressable>
        <IconButton name="ellipsis-horizontal" size={20} />
      </View>

      <Image
        source={{ uri: post.imageUrl }}
        style={[styles.image, { width: MAX_WIDTH, height: MAX_WIDTH }]}
        resizeMode="cover"
      />

      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <IconButton
            name={post.liked ? "heart" : "heart-outline"}
            size={26}
            color={post.liked ? colors.like : colors.text}
            onPress={onLike}
          />
          <IconButton name="chatbubble-outline" />
          <IconButton name="paper-plane-outline" />
        </View>
        <IconButton name="bookmark-outline" />
      </View>

      <View style={styles.info}>
        <Text style={styles.likes}>{post.likes.toLocaleString()} j'aime</Text>
        {post.caption && (
          <Text style={styles.caption}>
            <Text style={styles.username}>{post.author.username}</Text> {post.caption}
          </Text>
        )}
        {post.comments > 0 && (
          <Pressable>
            <Text style={styles.commentsLink}>
              Voir les {post.comments} commentaires
            </Text>
          </Pressable>
        )}
        <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  username: { color: colors.text, fontWeight: "600", fontSize: 13 },
  image: { alignSelf: "center" },
  actions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8 },
  actionsLeft: { flexDirection: "row", gap: 4 },
  info: { paddingHorizontal: 14, gap: 4, paddingBottom: 8 },
  likes: { color: colors.text, fontWeight: "600", fontSize: 13 },
  caption: { color: colors.text, fontSize: 13, lineHeight: 18 },
  commentsLink: { color: colors.primary, fontSize: 13 },
  time: { color: colors.textMuted, fontSize: 11 },
});
