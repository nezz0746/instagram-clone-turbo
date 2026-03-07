import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { profilesApi } from "../../lib/api";

export function useSearchQuery(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => profilesApi.search(query),
    enabled: query.length >= 2,
  });
}
