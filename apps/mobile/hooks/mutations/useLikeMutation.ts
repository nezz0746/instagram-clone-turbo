import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { postsApi, FeedPost } from "../../lib/api";

export function useLikeMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.like(postId),
    onMutate: async (postId) => {
      await qc.cancelQueries({ queryKey: queryKeys.feed() });
      const prev = qc.getQueryData<FeedPost[]>(queryKeys.feed());
      if (prev) {
        qc.setQueryData<FeedPost[]>(queryKeys.feed(), (old) =>
          old?.map((p) =>
            p.id === postId
              ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
              : p,
          ),
        );
      }
      return { prev };
    },
    onError: (_err, _postId, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.feed(), ctx.prev);
      }
    },
  });
}
