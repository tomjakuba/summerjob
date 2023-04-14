import { z } from "zod";
import { Serialized } from "./serialize";
import { CarSchema, RideSchema, WorkerSchema } from "lib/prisma/zod";

export const CarCompleteSchema = CarSchema.extend({
  owner: WorkerSchema,
  rides: z.array(RideSchema),
});

export type CarComplete = z.infer<typeof CarCompleteSchema>;

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

export const CarCreateSchema = z
  .object({
    ownerId: z.string().min(1),
    name: z.string().min(3),
    description: z.string(),
    seats: z.number().positive(),
    odometerStart: z.number(),
    odometerEnd: z.number().optional(),
    reimbursed: z.boolean().optional(),
    reimbursementAmount: z.number().optional(),
  })
  .strict();

export type CarCreateData = z.infer<typeof CarCreateSchema>;

export const CarUpdateSchema = CarCreateSchema.omit({
  ownerId: true,
}).partial();

export type CarUpdateData = z.infer<typeof CarUpdateSchema>;
