// import { PrismaClient } from "../../lib/prisma/client/index";
import { PrismaClient } from "../../prisma/client";
import { DataSource } from "./datasource";

const prisma = new PrismaClient();

export class PrismaDataSource implements DataSource {
  getPlan(planId: string) {
    // return prisma.plan.findUnique({
    //   where: {
    //     id: planId,
    //   },
    // });
    return new Promise<null>((resolve) => resolve(null));
  }
}
