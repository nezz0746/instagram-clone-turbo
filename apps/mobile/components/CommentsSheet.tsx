import { useState, useRef } from "react";
import {
  View, Text, StyleSheet, Modal, Pressable, FlatList,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@garona/shared";
import { Avatar } from "@garona/ui";
import { useCommentsQuery } from "../hooks/queries/useCommentsQuery";
import { useCommentMutation } from "../hooks/mutations/useCommentMutation";

type Props = {
  postId: string | null;
  visible: boolean;
  onClose: () => void;
};

export function CommentsSheet({ postId, visible, onClose }: Props) {
  const { data: comments = [], isLoading } = useCommentsQuery(visible ? postId : null);
  const commentMutation = useCommentMutation(postId || "");
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (!text.trim() || !postId || commentMutation.isPending) return;
    commentMutation.mutate(text.trim(), {
      onSuccess: () => setText(""),
    });
  };

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "maintenant";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}j`;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.handle} />
          <Text style={styles.title}>Commentaires</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Comments list */}
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Aucun commentaire</Text>
            <Text style={styles.emptyHint}>Sois le premier à commenter !</Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.comment}>
                <Avatar uri={(item as any).author?.avatarUrl} name={(item as any).author?.username} size={32} />
                <View style={styles.commentBody}>
                  <Text style={styles.commentText}>
                    <Text style={styles.commentAuthor}>
                      {(item as any).author?.username || "utilisateur"}
                    </Text>{" "}
                    {item.text}
                  </Text>
                  <Text style={styles.commentTime}>{timeAgo(item.createdAt)}</Text>
                </View>
              </View>
            )}
          />
        )}

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={300}
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || commentMutation.isPending}
            style={[styles.sendBtn, (!text.trim() || commentMutation.isPending) && { opacity: 0.4 }]}
          >
            {commentMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="send" size={20} color={colors.primary} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.text },
  closeBtn: { position: "absolute", right: 16, top: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "600", color: colors.text },
  emptyHint: { fontSize: 14, color: colors.textMuted },
  list: { padding: 16, gap: 16 },
  comment: { flexDirection: "row", gap: 10 },
  commentBody: { flex: 1, gap: 2 },
  commentText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  commentAuthor: { fontWeight: "600" },
  commentTime: { color: colors.textMuted, fontSize: 11 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingBottom: 30,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    maxHeight: 80,
  },
  sendBtn: { padding: 8 },
});
