import { Car, CarOdometer, Ride } from "lib/prisma/client";
import type { Worker } from "lib/prisma/client";
import { z } from "zod";
import { Serialized } from "./serialize";

export type CarWithOwner = Car & {
  owner: Worker;
};

export type CarComplete = Car & {
  owner: Worker;
  odometer: CarOdometer;
  rides: Ride[];
};

export function serializeCars(cars: CarComplete[]): Serialized<CarComplete[]> {
  return {
    data: JSON.stringify(cars),
  };
}

export function deserializeCars(
  cars: Serialized<CarComplete[]>
): CarComplete[] {
  return JSON.parse(cars.data);
}

export const CarUpdateSchema = z
  .object({
    name: z.string().min(3),
    description: z.string(),
    seats: z.number().positive(),
    odometer: z.object({
      start: z.number(),
      end: z.number(),
      reimbursed: z.boolean(),
      reimbursementAmount: z.number(),
    }),
  })
  .strict()
  .partial();

export type CarUpdateData = z.infer<typeof CarUpdateSchema>;

export const CarCreateSchema = CarUpdateSchema.merge(
  z.object({ ownerId: z.string().min(1) })
).required();

export type CarCreateData = z.infer<typeof CarCreateSchema>;
