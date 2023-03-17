import prisma from "lib/prisma/connection";
import { cache_setActiveSummerJobEvent } from "./data-store";

export async function getSummerJobEvents() {
  const events = await prisma.summerJobEvent.findMany({});
  return events;
}

export async function getActiveSummerJobEvent() {
  const events = await prisma.summerJobEvent.findMany({
    where: {
      isActive: true,
    },
  });
  return events[0];
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
}
