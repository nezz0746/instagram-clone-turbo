import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { profilesApi, Profile } from "../../lib/api";

export function useFollowMutation(username: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => profilesApi.follow(username),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.profile(username) });
      const prev = qc.getQueryData<Profile>(queryKeys.profile(username));
      if (prev) {
        qc.setQueryData<Profile>(queryKeys.profile(username), {
          ...prev,
          isFollowing: !prev.isFollowing,
          followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1,
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.profile(username), ctx.prev);
      }
    },
  });
}
