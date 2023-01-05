"use client";
import EditBox from "lib/components/forms/EditBox";
import EditWorker from "lib/components/forms/EditWorker";
import { useData } from "lib/fetcher/fetcher";
import { WorkerComplete } from "lib/types/worker";

type Params = {
  params: {
    id: string;
  };
};

export default function EditWorkerPage({ params }: Params) {
  const { data, error, isLoading } = useData<WorkerComplete, Error>(
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
