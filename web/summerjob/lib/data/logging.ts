import prisma from "lib/prisma/connection";

export async function addLogEvent(
  authorId: string,
  authorName: string,
  eventType: string,
  message: string
) {
  await prisma.logging.create({
    data: {
      authorId,
      authorName,
      eventType,
      message,
    },
  });
}
