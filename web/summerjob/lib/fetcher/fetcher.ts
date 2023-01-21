import { ApiError } from "lib/data/apiError";
import { Allergy } from "lib/prisma/client";
import { PlanComplete, PlanWithJobs } from "lib/types/plan";
import { ProposedJobComplete } from "lib/types/proposed-job";
import { WorkerComplete } from "lib/types/worker";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const get = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const data = await res.json();
    if (data.error && data.error.type && data.error.message) {
      throw new ApiError(data.error.message, data.error.type);
    }
    throw new Error("An error occurred while fetching the data.");
  }

  return res.json();
};

const sendData =
  (method: string) =>
  async (url: string, { arg }: { arg: any }) => {
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(arg),
    });

    if (!res.ok) {
      const data = await res.json();
      if (data.error && data.error.type && data.error.message) {
        throw new ApiError(data.error.message, data.error.type);
      }
      throw new Error("An error occurred while submitting the data.");
    }
    if (res.status === 204) {
      return;
    }
    return res.json();
  };

const post = sendData("POST");
const patch = sendData("PATCH");

function useData<T>(url: string) {
  return useSWR<T, Error>(url, get);
}

function useDataPartialUpdate(url: string, options?: any) {
  return useSWRMutation(url, patch, options);
}

function useDataCreate(url: string, options?: any) {
  return useSWRMutation(url, post, options);
}

export function useAPIWorkerUpdate(workerId: string, options?: any) {
  return useDataPartialUpdate(`/api/workers/${workerId}`, options);
}

export function useAPIWorkers() {
  return useData<WorkerComplete[]>("/api/workers");
}

export function useAPIWorkersWithoutJob(planId: string) {
  return useData<WorkerComplete[]>(
    `/api/workers?withoutJob=true&planId=${planId}`
  );
}

export function useAPIWorker(id: string) {
  return useData<WorkerComplete>(`/api/workers/${id}`);
}

export function useAPIPlans() {
  const properties = useData<PlanWithJobs[]>("/api/plans");
  if (properties.data) {
    for (const plan of properties.data) {
      plan.day = new Date(plan.day);
    }
  }
  return properties;
}

export function useAPIPlan(id: string) {
  const properties = useData<PlanComplete>(`/api/plans/${id}`);
  if (properties.data) {
    properties.data.day = new Date(properties.data.day);
  }
  return properties;
}

export function useAPIAllergies() {
  return useData<Allergy[]>("/api/allergies");
}

export function useAPIProposedJobs() {
  return useData<ProposedJobComplete[]>("/api/proposed-jobs");
}

export function useAPIProposedJobsNotInPlan(planId: string) {
  return useData<ProposedJobComplete[]>(
    `/api/proposed-jobs?notInPlan=${planId}`
  );
}

export function useAPIActiveJobCreate(options?: any) {
  return useDataCreate("/api/active-jobs", options);
}
