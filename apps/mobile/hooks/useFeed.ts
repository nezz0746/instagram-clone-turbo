import { useState, useEffect, useCallback } from "react";
import { feedApi, FeedPost } from "../lib/api";

export function useFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await feedApi.get();
      setPosts(data);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Impossible de charger le fil");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Optimistic toggle (actual API call is in FeedPostCard)
  const toggleLike = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }, []);

  return { posts, loading, error, refresh: load, toggleLike };
}
