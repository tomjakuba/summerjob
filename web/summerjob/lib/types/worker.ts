import { z } from "zod";
import type {
  Allergy,
  Car,
  Worker,
  WorkerAvailability,
} from "../../lib/prisma/client";
import { Serialized } from "./serialize";

export type WorkerComplete = Worker & {
  cars: Car[];
  allergies: Allergy[];
  availability: WorkerAvailability;
};

export type WorkerWithAllergies = Worker & {
  allergies: Allergy[];
};

export const WorkerUpdateSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
    allergyIds: z.array(z.string()),
    availability: z.array(z.coerce.date()),
  })
  .strict();

export type WorkerUpdateData = z.infer<typeof WorkerUpdateSchema>;

export type WorkerBasicInfo = Pick<Worker, "id" | "firstName" | "lastName">;

export function serializeWorker(
  data: WorkerComplete
): Serialized<WorkerComplete> {
  return {
    data: JSON.stringify(data),
  };
}

export function deserializeWorker(data: Serialized<WorkerComplete>) {
  let worker = JSON.parse(data.data) as WorkerComplete;
  worker = deserializeWorkerAvailability(worker);
  return worker;
}

export function serializeWorkers(
  data: WorkerComplete[]
): Serialized<WorkerComplete[]> {
  return {
    data: JSON.stringify(data),
  };
}

export function deserializeWorkers(data: Serialized<WorkerComplete[]>) {
  let workers = JSON.parse(data.data) as WorkerComplete[];
  workers = workers.map(deserializeWorkerAvailability);
  return workers;
}

export function deserializeWorkerAvailability(worker: WorkerComplete) {
  worker.availability.days = worker.availability.days.map(
    (day) => new Date(day)
  );
  return worker;
}
