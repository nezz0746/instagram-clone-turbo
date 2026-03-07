import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { vouchesApi } from "../../lib/api";

export function useRevokeMutation(userId: string, username: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => vouchesApi.revoke(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile(username) });
      qc.invalidateQueries({ queryKey: queryKeys.vouchesMe() });
    },
  });
}
