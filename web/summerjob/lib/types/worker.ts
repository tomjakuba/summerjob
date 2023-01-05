import { z } from "zod";
import type { Allergy, Car, Worker } from "../../lib/prisma/client";

export type WorkerComplete = Worker & {
  car?: Car;
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
