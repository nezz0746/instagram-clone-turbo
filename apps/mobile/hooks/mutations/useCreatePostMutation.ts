import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { postsApi } from "../../lib/api";

export function useCreatePostMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ imageUrls, caption }: { imageUrls: string[]; caption?: string }) =>
      postsApi.create(imageUrls, caption),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.feed() });
    },
  });
}
