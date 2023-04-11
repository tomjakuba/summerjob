import prisma from "lib/prisma/connection";
import {
  SummerJobEventComplete,
  SummerJobEventCreateData,
  SummerJobEventUpdateData,
} from "lib/types/summerjob-event";
import {
  cache_getActiveSummerJobEvent,
  cache_setActiveSummerJobEvent,
} from "./cache";
import { InvalidDataError } from "./internal-error";
import { blockNonAdmins } from "./users";

export async function getSummerJobEventById(
  id: string
): Promise<SummerJobEventComplete | null> {
  const event = await prisma.summerJobEvent.findUnique({
    where: {
      id,
    },
    include: {
      areas: {
        include: {
          jobs: true,
        },
      },
      plans: true,
    },
  });
  return event;
}

export async function getSummerJobEvents(): Promise<SummerJobEventComplete[]> {
  const events = await prisma.summerJobEvent.findMany({
    orderBy: {
      startDate: "desc",
    },
    include: {
      areas: {
        include: {
          jobs: true,
        },
      },
      plans: true,
    },
  });
  return events;
}

export async function getActiveSummerJobEvent() {
  const events = await prisma.summerJobEvent.findMany({
    where: {
      isActive: true,
    },
    include: {
      workers: true,
    },
  });
  return events.length > 0 ? events[0] : undefined;
}

export async function updateSummerJobEvent(
  id: string,
  event: SummerJobEventUpdateData
) {
  if (!event.isActive) {
    throw new InvalidDataError(
      "Cannot set event to inactive, set another to active instead."
    );
  }
  const currentlyActiveEvent = await cache_getActiveSummerJobEvent();
  if (currentlyActiveEvent && currentlyActiveEvent.id !== id) {
    const updatedEvent = await setActiveSummerJobEvent(id);
    await blockNonAdmins();
    return updatedEvent;
  }
  return currentlyActiveEvent;
}

export async function setActiveSummerJobEvent(id: string) {
  const [_1, _2, event] = await prisma.$transaction([
    // FIXME: This first query is a workaround for a missing feature in Prisma
    // Providing an invalid ID would set all events to inactive
    // This can be avoided once prisma adds `updateOrThrow` or similar
    // https://github.com/prisma/prisma/issues/10142
    prisma.summerJobEvent.findUniqueOrThrow({
      where: {
        id,
      },
    }),
    prisma.summerJobEvent.updateMany({
      data: {
        isActive: false,
      },
    }),
    prisma.summerJobEvent.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
    }),
  ]);
  cache_setActiveSummerJobEvent(event);
  return event;
}

export async function createSummerJobEvent(event: SummerJobEventCreateData) {
  const createdEvent = await prisma.summerJobEvent.create({
    data: event,
  });
  return createdEvent;
}

export async function deleteSummerJobEvent(id: string) {
  const event = await prisma.summerJobEvent.delete({
    where: {
      id,
    },
  });
  return event;
}
