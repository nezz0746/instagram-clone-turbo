import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Linking, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@garona/shared";

type Props = {
  onCodeScanned: (code: string) => void;
  onClose: () => void;
};

export function QRScanner({ onCodeScanned, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionBox}>
          <Ionicons name="camera-outline" size={48} color={colors.primary} />
          <Text style={styles.permTitle}>Caméra requise</Text>
          <Text style={styles.permDesc}>
            Pour scanner un QR code d'invitation, Garona a besoin d'accéder à ta caméra.
          </Text>
          <Pressable style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Autoriser la caméra</Text>
          </Pressable>
          <Pressable onPress={onClose}>
            <Text style={styles.cancelText}>Annuler</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Extract invite code from URL or raw code
    // Formats: garona://invite/CODE or https://garona.city/invite/CODE or just CODE
    let code = data;
    const match = data.match(/invite\/([A-Z0-9-]+)/i);
    if (match) code = match[1];

    onCodeScanned(code);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
            <Text style={styles.headerTitle}>Scanner l'invitation</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Scanner frame */}
          <View style={styles.frameContainer}>
            <View style={styles.frame}>
              {/* Corner decorations */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              Pointe ta caméra vers le QR code d'invitation
            </Text>
          </View>

          {/* Manual input */}
          <Pressable
            style={styles.manualBtn}
            onPress={() => {
              onClose();
              // Could open a text input modal instead
            }}
          >
            <Ionicons name="link-outline" size={18} color="#fff" />
            <Text style={styles.manualText}>J'ai un lien à la place</Text>
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const FRAME_SIZE = 250;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  frameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 16,
  },
  instructions: {
    alignItems: "center",
    paddingVertical: 24,
  },
  instructionText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    opacity: 0.9,
  },
  manualBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 48,
  },
  manualText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.7,
    textDecorationLine: "underline",
  },
  permissionBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: colors.bg,
    gap: 16,
  },
  permTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  permDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  permBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  permBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 8,
  },
});
