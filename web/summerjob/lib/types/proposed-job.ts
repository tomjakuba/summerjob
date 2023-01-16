import { ActiveJob, Allergy, Area, ProposedJob } from "lib/prisma/client";

export type ProposedJobWithArea = ProposedJob & {
  area: Area;
};

export type ProposedJobComplete = ProposedJob & {
  area: Area;
  allergens: Allergy[];
  activeJobs: ActiveJob[];
};
