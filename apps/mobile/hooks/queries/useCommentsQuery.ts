import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { postsApi } from "../../lib/api";

export function useCommentsQuery(postId: string | null) {
  return useQuery({
    queryKey: queryKeys.comments(postId!),
    queryFn: () => postsApi.comments(postId!),
    enabled: !!postId,
  });
}
