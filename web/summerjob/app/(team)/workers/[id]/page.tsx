"use client";
import EditBox from "lib/components/forms/EditBox";
import EditWorker from "lib/components/forms/EditWorker";
import { useAPIWorker } from "lib/fetcher/worker";

type Params = {
  params: {
    id: string;
  };
};

export default function EditWorkerPage({ params }: Params) {
  const { data, error, isLoading } = useAPIWorker(params.id);

  return (
    <>
      <section className="mb-3 mt-3">
        <EditBox>
          {isLoading && <h2>Načítám...</h2>}
          {data && <EditWorker worker={data} />}
        </EditBox>
      </section>
    </>
  );
}
