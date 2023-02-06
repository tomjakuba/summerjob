import { ActiveJob, Car, Ride, Worker } from "lib/prisma/client";
import { ActiveJobWithProposed } from "./active-job";

export type RideWithDriverCarDetails = Ride & {
  driver: Worker;
  car: Car;
};

export type RideComplete = Ride & {
  driver: Worker;
  car: Car;
  jobs: ActiveJobWithProposed[];
  passengers: Worker[];
};
