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

export const RideUpdateSchema = z
  .object({
    id: z.string(),
    driverId: z.string(),
    carId: z.string(),
    description: z.string(),
    jobIds: z.array(z.string()),
    passengerIds: z.array(z.string()),
  })
  .partial()
  .strict();

export type RideUpdate = z.infer<typeof RideUpdateSchema>;
