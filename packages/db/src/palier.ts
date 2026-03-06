// ─── Palier (Trust Tier) System ───
//
// Palier is computed from the sum of active (non-revoked) vouch weights.
// Higher-palier vouchers give more weight.

export const PALIER_THRESHOLDS = [
  { level: 0, vouches: 0, label: "Observateur", abilities: ["browse feed"] },
  { level: 1, vouches: 1, label: "Voisin", abilities: ["create profile", "follow"] },
  { level: 2, vouches: 3, label: "Habitant", abilities: ["post", "comment", "like"] },
  { level: 3, vouches: 5, label: "Toulousain", abilities: ["stories", "DMs"] },
  { level: 4, vouches: 10, label: "Ambassadeur", abilities: ["create events", "generate invites"] },
  { level: 5, vouches: 20, label: "Capitoul", abilities: ["moderate", "verify others"] },
] as const;

export type PalierLevel = 0 | 1 | 2 | 3 | 4 | 5;

export function computePalier(totalWeight: number): PalierLevel {
  for (let i = PALIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalWeight >= PALIER_THRESHOLDS[i].vouches) {
      return PALIER_THRESHOLDS[i].level as PalierLevel;
    }
  }
  return 0;
}

// Vouch weight based on voucher's palier
export function vouchWeight(voucherPalier: PalierLevel): number {
  switch (voucherPalier) {
    case 0: return 0; // palier 0 can't vouch
    case 1: return 1;
    case 2: return 1;
    case 3: return 2;
    case 4: return 3;
    case 5: return 5;
  }
}

// Can this palier level perform this action?
export function canPerform(palier: PalierLevel, action: string): boolean {
  for (let i = 0; i <= palier; i++) {
    if (PALIER_THRESHOLDS[i].abilities.includes(action)) return true;
  }
  return false;
}
