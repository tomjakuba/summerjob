import { RideCreateData } from "lib/types/ride";
import prisma from "lib/prisma/connection";

export async function createRide(data: RideCreateData) {
  const { jobIds, passengerIds, ...rideData } = data;
  const ride = await prisma.ride.create({
    data: {
      ...rideData,
      jobs: {
        connect: jobIds.map((id) => ({ id })),
      },
      passengers: {
        connect: passengerIds.map((id) => ({ id })),
      },
    },
  });
  return ride;
}
