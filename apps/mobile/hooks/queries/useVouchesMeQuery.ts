import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { vouchesApi } from "../../lib/api";

export function useVouchesMeQuery() {
  return useQuery({
    queryKey: queryKeys.vouchesMe(),
    queryFn: () => vouchesApi.me(),
  });
}
