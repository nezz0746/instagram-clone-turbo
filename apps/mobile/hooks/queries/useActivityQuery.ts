import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { activityApi } from "../../lib/api";

export function useActivityQuery(limit = 30) {
  return useQuery({
    queryKey: queryKeys.activity(),
    queryFn: () => activityApi.get(limit),
  });
}
