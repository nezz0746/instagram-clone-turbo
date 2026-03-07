import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { profilesApi } from "../../lib/api";

export function useProfileQuery(username: string) {
  return useQuery({
    queryKey: queryKeys.profile(username),
    queryFn: () => profilesApi.get(username),
    enabled: !!username,
  });
}
