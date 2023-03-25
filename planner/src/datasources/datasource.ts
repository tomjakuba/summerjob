import { Plan } from "../../prisma/client";

export interface DataSource {
  getPlan(planId: string): Promise<Plan | null>;
}
