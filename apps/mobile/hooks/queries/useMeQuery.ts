import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { meApi } from "../../lib/api";

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => meApi.get(),
    enabled,
  });
}
