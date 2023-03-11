import { z } from "zod";
import type { Allergy, Car, Worker } from "../../lib/prisma/client";

export type WorkerComplete = Worker & {
  cars: Car[];
  allergies: Allergy[];
};

export type WorkerWithAllergies = Worker & {
  allergies: Allergy[];
};

export const WorkerSerializableSchema = z
  .object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
    allergyIds: z.array(z.string()),
  })
  .strict();

export type WorkerSerializable = z.infer<typeof WorkerSerializableSchema>;

export type WorkerBasicInfo = Pick<Worker, "id" | "firstName" | "lastName">;

export function serializeWorker(data: WorkerComplete) {
  return JSON.stringify(data);
}

export function deserializeWorker(data: string) {
  return JSON.parse(data) as WorkerComplete;
}
