import { Area } from "lib/prisma/client";
import { useDataDelete } from "./fetcher";

export function useAPIAreaDelete(area: Area, options?: any) {
  return useDataDelete(
    `/api/summerjob-events/${area.summerJobEventId}/areas/${area.id}`,
    options
  );
}
