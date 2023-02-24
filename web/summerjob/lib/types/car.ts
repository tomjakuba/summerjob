import { Car, CarOdometer } from "lib/prisma/client";
import type { Worker } from "lib/prisma/client";

export type CarWithOwner = Car & {
  owner: Worker;
};

export type CarComplete = Car & {
  owner: Worker;
  odometers: CarOdometer[];
};

export function serializeCars(cars: Car[]) {
  return JSON.stringify(cars);
}

export function deserializeCars(cars: string) {
  return JSON.parse(cars);
}
