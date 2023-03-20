import { Area, ProposedJob } from "lib/prisma/client";
import { z } from "zod";
import { Serialized } from "./serialize";

export const AreaCreateSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    requiresCar: z.boolean(),
    summerJobEventId: z.string().min(1),
  })
  .strict();

export type AreaCreateData = z.infer<typeof AreaCreateSchema>;

export const AreaUpdateSchema = AreaCreateSchema.omit({
  summerJobEventId: true,
})
  .strict()
  .partial();

export type AreaUpdateData = z.infer<typeof AreaUpdateSchema>;

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

export function serializeArea(area: AreaComplete): Serialized<AreaComplete> {
  return {
    data: JSON.stringify(area),
  };
}

export function deserializeArea(data: Serialized<AreaComplete>): AreaComplete {
  return JSON.parse(data.data);
}
