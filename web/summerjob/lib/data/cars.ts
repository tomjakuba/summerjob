import { Car, CarOdometer } from "lib/prisma/client";
import prisma from "lib/prisma/connection";
import { CarComplete, CarUpdateData } from "lib/types/car";
import { getActiveSummerJobEventId } from "./data-store";
import type { Worker } from "lib/prisma/client";

export async function getCarById(id: string) {
  const activeEventId = await getActiveSummerJobEventId();
  const car = await prisma.car.findUnique({
    where: {
      id,
    },
    include: {
      owner: true,
      odometers: {
        where: {
          eventId: activeEventId,
        },
        take: 1,
      },
    },
  });
  if (!car) {
    return null;
  }
  const carWithOdometer = databaseCarToCarComplete(car);
  return carWithOdometer;
}

export async function getCars(): Promise<CarComplete[]> {
  const activeEventId = await getActiveSummerJobEventId();
  const cars = await prisma.car.findMany({
    include: {
      owner: true,
      odometers: {
        where: {
          eventId: activeEventId,
        },
        take: 1,
      },
    },
  });
  const carsWithOdometers = cars.map(databaseCarToCarComplete);
  return carsWithOdometers;
}

type CarWithOdometers = Car & {
  owner: Worker;
  odometers: CarOdometer[];
};

function databaseCarToCarComplete(car: CarWithOdometers) {
  const odometer = car.odometers[0];
  const { odometers, ...carWithoutOdometers } = car;
  return {
    ...carWithoutOdometers,
    odometer,
  };
}

export async function updateCar(carId: string, car: CarUpdateData) {
  const activeEventId = await getActiveSummerJobEventId();
  const carOdometer = car.odometer;
  await prisma.$transaction(async (tx) => {
    await tx.car.update({
      where: {
        id: carId,
      },
      data: {
        name: car.name,
        description: car.description,
        seats: car.seats,
      },
    });
    if (carOdometer && activeEventId) {
      await tx.carOdometer.update({
        where: {
          carId_eventId: {
            carId,
            eventId: activeEventId,
          },
        },
        data: {
          ...carOdometer,
        },
      });
    }
  });
}
