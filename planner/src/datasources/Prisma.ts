import { PrismaClient } from "../../prisma/client";
import { DataSource } from "./datasource";

const prisma = new PrismaClient();

export class PrismaDataSource implements DataSource {
  getPlan(planId: string) {
    return prisma.plan.findUnique({
      where: {
        id: planId,
      },
    });
  }
}
