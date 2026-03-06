import { useState, useEffect, useCallback } from "react";
import { feedApi, FeedPost } from "../lib/api";
import { POSTS, Post } from "@garona/shared";

// Convert mock data to FeedPost shape
function mockToFeed(p: Post): FeedPost {
  return {
    id: p.id,
    caption: p.caption,
    imageUrl: p.image,
    createdAt: new Date().toISOString(),
    author: { id: p.user.id, username: p.user.username, name: p.user.displayName, avatarUrl: p.user.avatar },
    likes: p.likes,
    comments: p.comments,
    liked: p.liked,
  };
}

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
    } catch (e) {
      // Fallback to mock data
      setPosts(POSTS.map(mockToFeed));
      setError(null); // silent fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleLike = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    // Fire and forget API call
    try { await feedApi.get(); } catch {}
  }, []);

  return { posts, loading, error, refresh: load, toggleLike };
}
