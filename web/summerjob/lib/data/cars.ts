import { prisma } from "lib/prisma/connection";
import { CarComplete } from "lib/types/car";

export async function getCars(): Promise<CarComplete[]> {
  // TODO accept event id as parameter
  const cars = await prisma.car.findMany({
    include: {
      owner: true,
      odometers: {
        orderBy: {
          event: {
            startDate: "desc",
          },
        },
        take: 1,
      },
    },
  });
  return cars;
}
