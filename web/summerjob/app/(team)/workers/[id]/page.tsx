"use client";
import EditBox from "lib/components/forms/EditBox";
import EditWorker from "lib/components/forms/EditWorker";
import useData from "lib/fetcher/fetcher";
import type { Worker } from "../../../../lib/prisma/client";

type Params = {
  params: {
    id: string;
  };
};

export default function EditWorkerPage({ params }: Params) {
  const { data, error, isLoading } = useData<Worker, Error>(
    `/api/users/${params.id}`
  );

  return (
    <>
      <section className="mb-3 mt-3">
        <EditBox>{data && <EditWorker worker={data} />}</EditBox>
      </section>
    </>
  );
}
