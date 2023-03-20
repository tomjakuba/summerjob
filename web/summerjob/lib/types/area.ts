import { Area, ProposedJob } from "lib/prisma/client";
import { Serialized } from "./serialize";

export type AreaComplete = Area & {
  jobs: ProposedJob[];
};

export function serializeAreas(
  areas: AreaComplete[]
): Serialized<AreaComplete[]> {
  return {
    data: JSON.stringify(areas),
  };
}

export function deserializeAreas(
  data: Serialized<AreaComplete[]>
): AreaComplete[] {
  return JSON.parse(data.data);
}
