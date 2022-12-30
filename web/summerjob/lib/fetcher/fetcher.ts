import { ApiError } from "lib/data/apiError";
import useSWR from "swr";

const fetcher = async (url: string) => {
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

function useData<T, E>(url: string) {
  return useSWR<T, E>(url, fetcher);
}

export default useData;
