import { UserComplete } from "lib/types/user";
import { useData } from "./fetcher";

export function useAPIUsers(options?: any) {
  return useData<UserComplete[]>("/api/users", options);
}
