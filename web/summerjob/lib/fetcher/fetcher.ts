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

export function useData<T>(url: string) {
  return useSWR<T, Error>(url, get);
}

export function useDataPartialUpdate(url: string, options?: any) {
  return useSWRMutation(url, patch, options);
}

export function useDataCreate(url: string, options?: any) {
  return useSWRMutation(url, post, options);
}

export function useAPIAllergies() {
  return useData<Allergy[]>("/api/allergies");
}
