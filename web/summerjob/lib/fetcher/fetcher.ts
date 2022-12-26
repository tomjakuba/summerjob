import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function useData(url: string) {
  return useSWR(url, fetcher);
}

export default useData;
