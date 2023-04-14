import prisma from "lib/prisma/connection";
import { CarComplete, CarCreateData, CarUpdateData } from "lib/types/car";
import { cache_getActiveSummerJobEventId } from "./cache";
import type { Worker } from "lib/prisma/client";
import { NoActiveEventError } from "./internal-error";

export async function getCarById(id: string): Promise<CarComplete | null> {
  const car = await prisma.car.findUnique({
    where: {
      id,
    },
    include: {
      owner: true,
      rides: true,
    },
  });
  return car;
}

export async function getCars(
  summerjobEventId?: string
): Promise<CarComplete[]> {
  const cars = await prisma.car.findMany({
    where: {
      owner: {
        registeredIn: {
          some: {
            isActive: true,
          },
        },
        blocked: false,
        deleted: false,
      },
      deleted: false,
      ...(summerjobEventId && { forEventId: summerjobEventId }),
    },
    include: {
      owner: true,
      rides: {
        where: {
          job: {
            plan: {
              summerJobEvent: {
                isActive: true,
              },
            },
          },
        },
      },
    },
  });
  return cars;
}

export async function updateCar(carId: string, car: CarUpdateData) {
  await prisma.car.update({
    where: {
      id: carId,
    },
    data: {
      name: car.name,
      description: car.description,
      seats: car.seats,
      reimbursed: car.reimbursed,
      reimbursementAmount: car.reimbursementAmount,
    },
  });
}

export async function createCar(carData: CarCreateData) {
  const activeEventId = await cache_getActiveSummerJobEventId();
  if (!activeEventId) {
    throw new NoActiveEventError();
  }
  // Make sure the odometer start is not greater than the odometer end
  if (!carData.odometerEnd) {
    carData.odometerEnd = carData.odometerStart;
  } else {
    carData.odometerEnd =
      carData.odometerEnd < carData.odometerStart
        ? carData.odometerStart
        : carData.odometerEnd;
  }

  const car = await prisma.car.create({
    data: {
      name: carData.name,
      description: carData.description,
      seats: carData.seats,
      odometerStart: carData.odometerStart,
      odometerEnd: carData.odometerEnd,
      reimbursed: carData.reimbursed,
      reimbursementAmount: carData.reimbursementAmount,
      ownerId: carData.ownerId,
      forEventId: activeEventId,
    },
  });
  return car;
}

export async function deleteCar(carId: string) {
  await prisma.$transaction(async (tx) => {
    // Check if car has any rides associated with it
    // If not, delete the car
    const car = await tx.car.findUnique({
      where: {
        id: carId,
      },
      include: {
        rides: true,
      },
    });
    if (!car) {
      return;
    }
    if (car.rides.length === 0) {
      await tx.car.delete({
        where: {
          id: carId,
        },
      });
      return;
    }
    // If the car has rides associated with it, anonymize the car instead and mark it as deleted
    await tx.car.update({
      where: {
        id: carId,
      },
      data: {
        deleted: true,
      },
    });
  });
}
