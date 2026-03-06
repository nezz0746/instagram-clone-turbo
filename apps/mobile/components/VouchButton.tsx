import { useState } from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@garona/shared";
import { vouchesApi } from "../lib/api";

type Props = {
  userId: string;
  hasVouched: boolean;
  onVouchChange?: (vouched: boolean, newPalier: number) => void;
};

export function VouchButton({ userId, hasVouched: initialVouched, onVouchChange }: Props) {
  const [vouched, setVouched] = useState(initialVouched);
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      if (vouched) {
        const { newPalier } = await vouchesApi.revoke(userId);
        setVouched(false);
        onVouchChange?.(false, newPalier);
      } else {
        const { newPalier } = await vouchesApi.vouch(userId);
        setVouched(true);
        onVouchChange?.(true, newPalier);
      }
    } catch (e) {
      // Optimistic toggle anyway for demo
      setVouched(!vouched);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      style={[styles.btn, vouched ? styles.vouched : styles.unvouched]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vouched ? colors.primary : "#fff"} />
      ) : (
        <>
          <Ionicons
            name={vouched ? "shield-checkmark" : "shield-checkmark-outline"}
            size={16}
            color={vouched ? colors.primary : "#fff"}
          />
          <Text style={[styles.text, vouched ? styles.vouchedText : styles.unvouchedText]}>
            {vouched ? "Parrainé" : "Parrainer"}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unvouched: {
    backgroundColor: colors.primary,
  },
  vouched: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    fontWeight: "600",
    fontSize: 13,
  },
  unvouchedText: {
    color: "#fff",
  },
  vouchedText: {
    color: colors.primary,
  },
});
