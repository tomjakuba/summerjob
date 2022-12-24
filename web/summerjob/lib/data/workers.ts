import { Prisma, PrismaClient } from "../prisma/client";

const prisma = new PrismaClient();

export async function getWorkers() {
  const workers = await prisma.worker.findMany();
  return workers;
}
