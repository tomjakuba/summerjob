import { Area } from "lib/prisma/client";
import { Serialized } from "./serialize";

export function serializeAreas(areas: Area[]): Serialized<Area[]> {
  return {
    data: JSON.stringify(areas),
  };
}

export function deserializeAreas(data: Serialized<Area[]>): Area[] {
  return JSON.parse(data.data);
}
