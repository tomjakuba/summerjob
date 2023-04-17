import {
  ActiveJob,
  Area,
  Car,
  Plan,
  ProposedJob,
  Ride,
  WorkerAvailability,
  Worker,
} from "../../prisma/client";

export interface DataSource {
  getPlan(planId: string): Promise<PlanComplete | null>;
  getWorkersWithoutJob(plan: Plan): Promise<WorkerComplete[]>;
  getProposedJobs(eventId: string, day: Date): Promise<ProposedJobComplete[]>;
  setPlannedJobs(planId: string, jobs: JobToBePlanned[]): void;
}

export type PlanComplete = Plan & {
  jobs: ActiveJobNoPlan[];
};

export type ActiveJobNoPlan = ActiveJob & {
  workers: WorkerComplete[];
  proposedJob: ProposedJobNoActive;
  rides: RideComplete[];
  responsibleWorker: Worker | null;
};

export type WorkerComplete = Worker & {
  cars: Car[];
  availability: WorkerAvailability;
};

export type ProposedJobNoActive = ProposedJob & {
  area: Area;
};

export type RideComplete = Ride & {
  driver: Worker;
  car: Car;
  job: ActiveJobWithProposed;
  passengers: Worker[];
};

export type ActiveJobWithProposed = ActiveJob & {
  proposedJob: ProposedJob;
};

export type ProposedJobComplete = ProposedJob & {
  area: Area;
  activeJobs: ActiveJob[];
};

export type JobToBePlanned = {
  proposedJobId: string;
  privateDescription: string;
  publicDescription: string;
  workerIds: string[];
  rides: {
    driverId: string;
    carId: string;
    passengerIds: string[];
  }[];
  responsibleWorkerId?: string;
};
