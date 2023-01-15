import { ActiveJob, ProposedJob } from "lib/prisma/client";
import { ProposedJobWithArea } from "./proposed-job";
import type { Worker } from "lib/prisma/client";
import { RideComplete } from "./ride";

export type ActiveJobNoPlan = ActiveJob & {
  workers: Worker[];
  proposedJob: ProposedJobWithArea;
  ride: RideComplete;
};

export type ActiveJobWithProposed = ActiveJob & {
  proposedJob: ProposedJob;
};
