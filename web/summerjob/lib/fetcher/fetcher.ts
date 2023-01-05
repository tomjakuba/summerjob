import { ApiError } from "lib/data/apiError";
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

const patch = async (url: string, { arg }: { arg: any }) => {
  const res = await fetch(url, {
    method: "PUT",
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

export function useData<T, E>(url: string) {
  return useSWR<T, E>(url, get);
}

export function useDataPartialUpdate(url: string, options?: any) {
  return useSWRMutation(url, patch, options);
}
