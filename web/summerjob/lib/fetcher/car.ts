import type { CarsAPIGetResponse } from "pages/api/cars";
import { useData } from "./fetcher";

export function useAPICars(options?: any) {
  return useData<CarsAPIGetResponse>("/api/cars", options);
}
