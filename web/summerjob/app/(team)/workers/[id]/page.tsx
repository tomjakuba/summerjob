"use client";
import EditBox from "lib/components/forms/EditBox";
import EditWorker from "lib/components/worker/EditWorker";
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
      <section className="mb-3">
        <EditBox>
          {isLoading && (
            <center>
              <h3>Načítám...</h3>
            </center>
          )}
          {data && <EditWorker worker={data} />}
        </EditBox>
      </section>
    </>
  );
}
