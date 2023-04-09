import prisma from "lib/prisma/connection";
import { APILogEvent } from "lib/types/logger";

export async function addLogEvent(
  authorId: string,
  authorName: string,
  resourceId: string,
  eventType: string,
  message: string
) {
  await prisma.logging.create({
    data: {
      authorId,
      authorName,
      resourceId,
      eventType,
      message,
    },
  });
}

type LogsSearchParams = {
  text?: string;
  type?: APILogEvent;
  limit?: number;
  offset?: number;
};
export async function getLogs({ text, type, limit, offset }: LogsSearchParams) {
  offset ??= 0;
  limit ??= 20;
  const filters = [];
  if (text) {
    filters.push({
      OR: [
        { authorId: { contains: text } },
        { authorName: { contains: text } },
        { message: { contains: text } },
      ],
    });
  }
  if (type) {
    filters.push({ eventType: type });
  }
  const where = filters.length > 0 ? { AND: filters } : {};
  return await prisma.logging.findMany({
    where: where,
    orderBy: {
      timestamp: "desc",
    },
    skip: offset,
    take: limit,
  });
}
