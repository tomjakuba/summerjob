import { Area, ProposedJob } from "lib/prisma/client";

export type ProposedJobWithArea = ProposedJob & {
  area: Area;
};
