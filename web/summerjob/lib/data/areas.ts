import prisma from "lib/prisma/connection";

export async function getAreas() {
  return await prisma.area.findMany({});
}
