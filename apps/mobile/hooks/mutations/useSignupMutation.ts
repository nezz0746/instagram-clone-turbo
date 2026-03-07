import { useMutation } from "@tanstack/react-query";
import { signupApi } from "../../lib/api";

export function useSignupMutation() {
  return useMutation({
    mutationFn: ({ name, username, inviteCode }: { name: string; username: string; inviteCode?: string }) =>
      signupApi.create(name, username, inviteCode),
  });
}
