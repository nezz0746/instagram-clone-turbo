import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@garona/shared";
import { postsApi } from "../../lib/api";
import { API_URL, useAuth } from "../../lib/auth";

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const palier = user?.palier ?? 0;
  const canPost = palier >= 2;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à la caméra est nécessaire");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!image) return;
    setUploading(true);

    try {
      // Upload image
      const formData = new FormData();
      const filename = image.split("/").pop() || "photo.jpg";
      formData.append("file", {
        uri: image,
        name: filename,
        type: "image/jpeg",
      } as any);

      const uploadRes = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      let imageUrl = image; // fallback to local URI for demo
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      // Create post
      await postsApi.create(imageUrl, caption || undefined);

      // Reset
      setImage(null);
      setCaption("");
      Alert.alert("Publié ! 🎉", "Ta photo est maintenant visible");
    } catch (e: any) {
      Alert.alert("Erreur", e.message || "Impossible de publier");
    } finally {
      setUploading(false);
    }
  };

  if (!canPost) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <View style={styles.lockedIcon}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
        </View>
        <Text style={styles.lockedTitle}>Palier 2 requis</Text>
        <Text style={styles.lockedDesc}>
          Tu dois être au moins Habitant (3 parrainages) pour publier des photos.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nouvelle publication</Text>
        <Pressable
          style={[styles.publishBtn, (!image || uploading) && styles.publishBtnDisabled]}
          onPress={handlePost}
          disabled={!image || uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.publishText}>Publier</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image preview or picker */}
        {image ? (
          <Pressable onPress={pickImage}>
            <Image source={{ uri: image }} style={styles.preview} />
            <View style={styles.changeOverlay}>
              <Ionicons name="camera-outline" size={24} color="#fff" />
              <Text style={styles.changeText}>Changer</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.pickerSection}>
            <Pressable style={styles.pickerBtn} onPress={pickImage}>
              <Ionicons name="images-outline" size={32} color={colors.primary} />
              <Text style={styles.pickerText}>Galerie</Text>
            </Pressable>
            <Pressable style={styles.pickerBtn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={32} color={colors.primary} />
              <Text style={styles.pickerText}>Caméra</Text>
            </Pressable>
          </View>
        )}

        {/* Caption */}
        <TextInput
          style={styles.captionInput}
          placeholder="Écris une légende..."
          placeholderTextColor={colors.textMuted}
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={500}
        />

        {caption.length > 0 && (
          <Text style={styles.charCount}>{caption.length}/500</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
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
  publishBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  publishBtnDisabled: { opacity: 0.4 },
  publishText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  content: { padding: 16, gap: 16 },
  preview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  changeOverlay: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeText: { color: "#fff", fontSize: 13, fontWeight: "500" },
  pickerSection: {
    flexDirection: "row",
    gap: 12,
  },
  pickerBtn: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  pickerText: { color: colors.primary, fontSize: 14, fontWeight: "600" },
  captionInput: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  charCount: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "right",
  },
  lockedIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  lockedTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
  lockedDesc: { fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 22, marginTop: 8 },
});
