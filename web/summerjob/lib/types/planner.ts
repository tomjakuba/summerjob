import { z } from "zod";

export const PlannerSubmitSchema = z.object({
  planId: z.string(),
});

export type PlannerSubmitData = z.infer<typeof PlannerSubmitSchema>;
