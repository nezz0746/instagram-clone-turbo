import { useMutation } from "@tanstack/react-query";
import { vouchesApi } from "../../lib/api";

export function useCreateInviteMutation() {
  return useMutation({
    mutationFn: () => vouchesApi.createInvite(),
  });
}
