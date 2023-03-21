import { Allergy, Ride } from "lib/prisma/client";
import { Serialized } from "./serialize";

export type MyRide = {
  car: string;
  isDriver: boolean;
  driverName: string;
  endsAtMyJob: boolean;
  endJobName: string;
};

export type MyPlan = {
  day: Date;
  job?: {
    name: string;
    description: string;
    responsibleWorkerName: string;
    workerNames: string[];
    contact: string;
    allergens: Allergy[];
    location: {
      name: string;
      description: string;
      address: string;
    };
    hasFood: boolean;
    hasShower: boolean;
    ride?: MyRide;
  };
};

export function serializeMyPlan(plan: MyPlan): Serialized<MyPlan> {
  return {
    data: JSON.stringify(plan),
  };
}

export function deserializeMyPlan(serialized: Serialized<MyPlan>): MyPlan {
  const myPlan = JSON.parse(serialized.data);
  myPlan.day = new Date(myPlan.day);
  return myPlan;
}

export function serializeMyPlans(plans: MyPlan[]): Serialized<MyPlan[]> {
  return {
    data: JSON.stringify(plans),
  };
}

export function deserializeMyPlans(serialized: Serialized<MyPlan[]>): MyPlan[] {
  const myPlans = JSON.parse(serialized.data);
  for (const myPlan of myPlans) {
    myPlan.day = new Date(myPlan.day);
  }
  return myPlans;
}
