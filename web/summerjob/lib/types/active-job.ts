import { ActiveJob, Ride } from "lib/prisma/client";
import { ProposedJobWithArea } from "./proposed-job";
import type { Worker } from "lib/prisma/client";

export type ActiveJobNoPlan = ActiveJob & {
  workers: Worker[];
  proposedJob: ProposedJobWithArea;
  ride: Ride;
};
