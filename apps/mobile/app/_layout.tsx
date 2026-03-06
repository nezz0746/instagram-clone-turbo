import { useState, useCallback } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@garona/shared";
import { AuthContext, AuthUser } from "../lib/auth";
import { OnboardingCarousel } from "../components/OnboardingCarousel";
import { QRScanner } from "../components/QRScanner";
import { InviteValidator } from "../components/InviteValidator";

type AppState = "onboarding" | "scanning" | "validating" | "authenticated";

export default function RootLayout() {
  const [appState, setAppState] = useState<AppState>("onboarding");
  const [user, setUser] = useState<AuthUser>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string>("");

  const handleOnboardingFinish = useCallback(() => {
    setAppState("scanning");
  }, []);

  const handleCodeScanned = useCallback((code: string) => {
    setScannedCode(code);
    setAppState("validating");
  }, []);

  const handleInviteAccepted = useCallback((code: string) => {
    setInviteCode(code);
    // In production: trigger BetterAuth sign-in flow here
    // For now: mock sign-in with a seed user
    setUser({
      id: "mock-new-user",
      name: "Nouveau",
      username: "nouveau.toulouse",
      avatarUrl: "https://i.pravatar.cc/150?u=nouveau",
      palier: 0,
    });
    setAppState("authenticated");
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setInviteCode(null);
    setAppState("onboarding");
  }, []);

  // Unauthenticated states
  if (appState === "onboarding") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style="dark" />
        <OnboardingCarousel onFinish={handleOnboardingFinish} />
      </View>
    );
  }

  if (appState === "scanning") {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        <QRScanner
          onCodeScanned={handleCodeScanned}
          onClose={() => setAppState("onboarding")}
        />
      </View>
    );
  }

  if (appState === "validating") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style="dark" />
        <InviteValidator
          code={scannedCode}
          onAccept={handleInviteAccepted}
          onBack={() => setAppState("scanning")}
        />
      </View>
    );
  }

  // Authenticated
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: false,
        inviteCode,
        setInviteCode,
        signIn: () => {},
        signOut,
      }}
    >
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </View>
    </AuthContext.Provider>
  );
}
