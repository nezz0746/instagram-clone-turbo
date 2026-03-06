import { useState, useEffect, useCallback } from "react";
import { profilesApi, Profile } from "../lib/api";

export function useProfile(username: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await profilesApi.get(username);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => { load(); }, [load]);

  const toggleFollow = useCallback(async () => {
    if (!profile) return;
    try {
      const { following } = await profilesApi.follow(username);
      setProfile((p) => p ? {
        ...p,
        isFollowing: following,
        followers: following ? p.followers + 1 : p.followers - 1,
      } : p);
    } catch {}
  }, [profile, username]);

  return { profile, loading, refresh: load, toggleFollow };
}
