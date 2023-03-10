import ErrorPage404 from "lib/components/404/404";
import EditBox from "lib/components/forms/EditBox";
import EditProposedJobForm from "lib/components/jobs/EditProposedJobForm";
import { getProposedJobById } from "lib/data/proposed-jobs";
import { serializeProposedJob } from "lib/types/proposed-job";

type PathProps = {
  params: {
    id: string;
  };
};

export default async function EditProposedJobPage({ params }: PathProps) {
  const job = await getProposedJobById(params.id);
  if (!job) {
    return <ErrorPage404 message="Job nenalezen."></ErrorPage404>;
  }
  const serialized = serializeProposedJob(job);
  return (
    <section>
      <EditBox>
        <EditProposedJobForm serializedJob={serialized} />
      </EditBox>
    </section>
  );
}
