import { ApiError, ApiErrorSchema } from "lib/data/api-error";
import useSWR, { Key } from "swr";
import useSWRMutation from "swr/mutation";

const send = (method: string) => async (url: string) => {
  const res = await fetch(url, { method: method });

  if (!res.ok) {
    const data = await res.json();
    const parsingResult = ApiErrorSchema.safeParse(data.error);
    if (parsingResult.success) {
      throw new ApiError(parsingResult.data.reason, parsingResult.data.type);
    }
    throw new Error("An error occurred during this request.");
  }
  if (res.status === 204) {
    return;
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
      const parsingResult = ApiErrorSchema.safeParse(data.error);
      if (parsingResult.success) {
        throw new ApiError(parsingResult.data.reason, parsingResult.data.type);
      }
      throw new Error("An error occurred while submitting the data.");
    }
    if (res.status === 204) {
      return;
    }
    return res.json();
  };

const get = send("GET");
const post = sendData("POST");
const patch = sendData("PATCH");
const del = send("DELETE");

export function useData<T>(url: string, options?: any) {
  return useSWR<T, Error>(url, get, options);
}

export function useDataPartialUpdate<T>(url: string, options?: any) {
  // Bugfix until this is solved https://github.com/vercel/swr/issues/2376
  options = { throwOnError: false, ...options };
  return useSWRMutation<any, any, Key, T>(url, patch, options);
}

export function useDataPartialUpdateDynamic<T>(
  func: () => string,
  getUrlFunc: (value: string) => string,
  options?: any
) {
  // Bugfix until this is solved https://github.com/vercel/swr/issues/2376
  options = { throwOnError: false, ...options };
  return useSWRMutation<any, any, Key, T>(
    () => getUrlFunc(func()),
    patch,
    options
  );
}

export function useDataCreate<T>(url: string, options?: any) {
  // Bugfix until this is solved https://github.com/vercel/swr/issues/2376
  options = { throwOnError: false, ...options };
  return useSWRMutation<any, any, Key, T>(url, post, options);
}

export function useDataDeleteDynamic(
  getUrl: () => string | undefined,
  options?: any
) {
  return useSWRMutation<any, any, Key, void>(getUrl, del, options);
}
