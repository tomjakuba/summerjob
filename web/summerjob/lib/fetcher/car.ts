import type { CarCreateData, CarUpdateData } from "lib/types/car";
import type { CarsAPIGetResponse } from "pages/api/cars";
import { useData, useDataCreate, useDataPartialUpdate } from "./fetcher";

export function useAPICars(options?: any) {
  return useData<CarsAPIGetResponse>("/api/cars", options);
}

export function useAPICarUpdate(carId: string, options?: any) {
  return useDataPartialUpdate<CarUpdateData>(`/api/cars/${carId}`, options);
}

export function useAPICarCreate(options?: any) {
  return useDataCreate<CarCreateData>("/api/cars", options);
}
