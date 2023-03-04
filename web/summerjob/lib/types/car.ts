import { Car, CarOdometer } from "lib/prisma/client";
import type { Worker } from "lib/prisma/client";
import { z } from "zod";

export type CarWithOwner = Car & {
  owner: Worker;
};

export type CarComplete = Car & {
  owner: Worker;
  odometer: CarOdometer;
};

export function serializeCars(cars: Car[]) {
  return JSON.stringify(cars);
}

export function deserializeCars(cars: string) {
  return JSON.parse(cars);
}

export const CarUpdateSchema = z
  .object({
    id: z.string(),
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
  z.object({ owner: z.string() })
);

export type CarCreateData = z.infer<typeof CarCreateSchema>;
