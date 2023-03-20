import { Plan, SummerJobEvent } from "lib/prisma/client";
import { z } from "zod";
import { AreaComplete } from "./area";
import { deserializePlanDate } from "./plan";
import { Serialized } from "./serialize";

export type SummerJobEventComplete = SummerJobEvent & {
  areas: AreaComplete[];
  plans: Plan[];
};

export const SummerJobEventCreateSchema = z
  .object({
    name: z.string().min(1),
    startDate: z.date().or(z.string().min(1).pipe(z.coerce.date())),
    endDate: z.date().or(z.string().min(1).pipe(z.coerce.date())),
  })
  .strict();

export type SummerJobEventCreateDataInput = z.input<
  typeof SummerJobEventCreateSchema
>;

export type SummerJobEventCreateData = z.infer<
  typeof SummerJobEventCreateSchema
>;

export const SummerJobEventUpdateSchema = SummerJobEventCreateSchema.extend({
  isActive: z.boolean(),
})
  .strict()
  .partial();

export type SummerJobEventUpdateDataInput = z.input<
  typeof SummerJobEventUpdateSchema
>;

export type SummerJobEventUpdateData = z.infer<
  typeof SummerJobEventUpdateSchema
>;

export function serializeSummerJobEvent(
  event: SummerJobEventComplete
): Serialized<SummerJobEventComplete> {
  return {
    data: JSON.stringify(event),
  };
}

export function deserializeSummerJobEvent(
  event: Serialized<SummerJobEventComplete>
): SummerJobEventComplete {
  const dEvent = JSON.parse(event.data) as SummerJobEventComplete;
  dEvent.startDate = new Date(dEvent.startDate);
  dEvent.endDate = new Date(dEvent.endDate);
  return dEvent;
}

export function serializeSummerJobEvents(
  events: SummerJobEventComplete[]
): Serialized<SummerJobEventComplete[]> {
  return {
    data: JSON.stringify(events),
  };
}

export function deserializeSummerJobEvents(
  event: Serialized<SummerJobEventComplete[]>
): SummerJobEventComplete[] {
  const dEvents = JSON.parse(event.data) as SummerJobEventComplete[];
  for (const dEvent of dEvents) {
    dEvent.startDate = new Date(dEvent.startDate);
    dEvent.endDate = new Date(dEvent.endDate);
    dEvent.plans = dEvent.plans.map(deserializePlanDate);
  }
  return dEvents;
}
