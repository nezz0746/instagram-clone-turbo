import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { profilesApi } from "../../lib/api";

export function useProfilePostsFeedQuery(username: string) {
  return useQuery({
    queryKey: queryKeys.profilePostsFeed(username),
    queryFn: () => profilesApi.postsFeed(username),
    enabled: !!username,
  });
}
