"use client";
import EditActiveJobForm from "lib/components/active-job/EditActiveJob";
import EditBox from "lib/components/forms/EditBox";
import { useAPIActiveJob } from "lib/fetcher/active-job";

type PathProps = {
  params: {
    id: string;
    jobId: string;
  };
};

export default function EditActiveJobPage({ params }: PathProps) {
  const { data, error, isLoading } = useAPIActiveJob(params.jobId);
  return (
    <section>
      <EditBox>
        {isLoading && (
          <center>
            <h4>Načítám...</h4>
          </center>
        )}
        {error && !isLoading && (
          <center>
            <h4>Při načítání dat došlo k chybě</h4>
          </center>
        )}
        {data && <EditActiveJobForm job={data}></EditActiveJobForm>}
      </EditBox>
    </section>
  );
}
