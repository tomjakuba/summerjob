import { SummerJobEvent } from "lib/prisma/client";
import { z } from "zod";
import { Serialized } from "./serialize";

export const SummerJobEventCreateSchema = z
  .object({
    name: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .strict();

export type SummerJobEventCreateData = z.infer<
  typeof SummerJobEventCreateSchema
>;

export function serializeSummerJobEvent(
  event: SummerJobEvent
): Serialized<SummerJobEvent> {
  return {
    data: JSON.stringify(event),
  };
}

export function deserializeSummerJobEvent(
  event: Serialized<SummerJobEvent>
): SummerJobEvent {
  const dEvent = JSON.parse(event.data) as SummerJobEvent;
  dEvent.startDate = new Date(dEvent.startDate);
  dEvent.endDate = new Date(dEvent.endDate);
  return dEvent;
}

export function serializeSummerJobEvents(
  events: SummerJobEvent[]
): Serialized<SummerJobEvent[]> {
  return {
    data: JSON.stringify(events),
  };
}

export function deserializeSummerJobEvents(
  event: Serialized<SummerJobEvent[]>
): SummerJobEvent[] {
  const dEvents = JSON.parse(event.data) as SummerJobEvent[];
  for (const dEvent of dEvents) {
    dEvent.startDate = new Date(dEvent.startDate);
    dEvent.endDate = new Date(dEvent.endDate);
  }
  return dEvents;
}
