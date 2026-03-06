import { Platform } from "react-native";
import { Passkey } from "react-native-passkey";

const RP_ID = "garona.city"; // must match your domain
const RP_NAME = "Garona";

export async function isPasskeySupported(): Promise<boolean> {
  try {
    // react-native-passkey checks platform support
    return Passkey.isSupported();
  } catch {
    return false;
  }
}

export async function createPasskey(userId: string, userName: string): Promise<{ credentialId: string; publicKey: string } | null> {
  try {
    const supported = await isPasskeySupported();
    if (!supported) return null;

    const result = await Passkey.register({
      challenge: generateChallenge(),
      rp: { id: RP_ID, name: RP_NAME },
      user: {
        id: userId,
        name: userName,
        displayName: userName,
      },
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "preferred",
        residentKey: "preferred",
      },
    });

    return {
      credentialId: result.id,
      publicKey: result.response.publicKey || "",
    };
  } catch (e) {
    console.log("Passkey creation failed:", e);
    return null;
  }
}

export async function authenticatePasskey(): Promise<{ credentialId: string; signature: string } | null> {
  try {
    const supported = await isPasskeySupported();
    if (!supported) return null;

    const result = await Passkey.authenticate({
      challenge: generateChallenge(),
      rpId: RP_ID,
      userVerification: "preferred",
    });

    return {
      credentialId: result.id,
      signature: result.response.signature || "",
    };
  } catch (e) {
    console.log("Passkey auth failed:", e);
    return null;
  }
}

function generateChallenge(): string {
  // Generate a random challenge (in production, get this from the server)
  const array = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return btoa(String.fromCharCode(...array));
}
