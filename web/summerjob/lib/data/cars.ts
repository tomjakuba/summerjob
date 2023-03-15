import { Car, CarOdometer, Ride } from "lib/prisma/client";
import prisma from "lib/prisma/connection";
import { CarComplete, CarCreateData, CarUpdateData } from "lib/types/car";
import { getActiveSummerJobEventId } from "./data-store";
import type { Worker } from "lib/prisma/client";
import { NoActiveEventError } from "./internal-error";

export async function getCarById(id: string): Promise<CarComplete | null> {
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
      rides: true,
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
  if (!activeEventId) throw new NoActiveEventError();
  const cars = await prisma.car.findMany({
    include: {
      owner: true,
      odometers: {
        where: {
          eventId: activeEventId,
        },
        take: 1,
      },
      rides: {
        where: {
          job: {
            plan: {
              summerJobEventId: activeEventId,
            },
          },
        },
      },
    },
  });
  const carsWithOdometers = cars.map(databaseCarToCarComplete);
  return carsWithOdometers;
}

type CarWithOdometers = Car & {
  owner: Worker;
  rides: Ride[];
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

export async function createCar(carData: CarCreateData) {
  const activeEventId = await getActiveSummerJobEventId();
  if (!activeEventId) {
    throw new NoActiveEventError();
  }
  const { odometer, ...carWithoutOdometer } = carData;
  odometer.end = odometer.end < odometer.start ? odometer.start : odometer.end;
  const car = await prisma.car.create({
    data: {
      ...carWithoutOdometer,
      odometers: {
        create: {
          ...odometer,
          eventId: activeEventId,
        },
      },
    },
  });
  return car;
}

export async function deleteCar(carId: string) {
  await prisma.car.delete({
    where: {
      id: carId,
    },
  });
}
