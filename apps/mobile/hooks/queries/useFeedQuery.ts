import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { feedApi } from "../../lib/api";

export function useFeedQuery(limit = 20, offset = 0) {
  return useQuery({
    queryKey: queryKeys.feed(limit, offset),
    queryFn: () => feedApi.get(limit, offset),
  });
}
