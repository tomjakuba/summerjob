import { ActiveJob, Car, Ride, Worker } from "lib/prisma/client";
import { z } from "zod";
import { ActiveJobWithProposed } from "./active-job";

export type RideWithDriverCarDetails = Ride & {
  driver: Worker;
  car: Car;
};

export type RideComplete = Ride & {
  driver: Worker;
  car: Car;
  jobs: ActiveJobWithProposed[];
  passengers: Worker[];
};

export const RideCreateSchema = z
  .object({
    driverId: z.string(),
    carId: z.string(),
    description: z.string().optional(),
    jobIds: z.array(z.string()),
    passengerIds: z.array(z.string()),
  })
  .strict();

export type RideCreateData = z.infer<typeof RideCreateSchema>;

export const RideUpdateSchema = RideCreateSchema.partial().strict();

export type RideUpdateData = z.infer<typeof RideUpdateSchema>;
