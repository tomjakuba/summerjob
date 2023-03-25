import { Plan, PrismaClient } from "../../prisma/client";
import { DataSource } from "./DataSource";
import { getPlanById } from "./prisma/plan";
import { getProposedJobs } from "./prisma/proposed-job";
import { getWorkersWithoutJob } from "./prisma/worker";

const prisma = new PrismaClient();

export class PrismaDataSource implements DataSource {
  getPlan(planId: string) {
    return getPlanById(planId, prisma);
  }

  getWorkersWithoutJob(plan: Plan) {
    return getWorkersWithoutJob(plan, prisma);
  }

  getProposedJobs(eventId: string, day: Date) {
    return getProposedJobs(eventId, day, prisma);
  }
}
