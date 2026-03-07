import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { postsApi, FeedPost } from "../../lib/api";

export function useDeletePostMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.delete(postId),
    onMutate: async (postId) => {
      await qc.cancelQueries({ queryKey: queryKeys.feed() });
      const prev = qc.getQueryData<FeedPost[]>(queryKeys.feed());
      if (prev) {
        qc.setQueryData<FeedPost[]>(queryKeys.feed(), (old) =>
          old?.filter((p) => p.id !== postId),
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
