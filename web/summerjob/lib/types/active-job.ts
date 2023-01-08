import { ActiveJob, Ride } from "lib/prisma/client";
import { ProposedJobWithArea } from "./proposed-job";

export type ActiveJobNoPlan = ActiveJob & {
  workers: Worker[];
  proposedJob: ProposedJobWithArea;
  ride: Ride;
};
