import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { postsApi } from "../../lib/api";

export function useCommentMutation(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => postsApi.comment(postId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments(postId) });
      qc.invalidateQueries({ queryKey: queryKeys.feed() });
    },
  });
}
