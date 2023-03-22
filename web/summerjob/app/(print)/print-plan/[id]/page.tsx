import ErrorPage404 from "lib/components/404/404";
import RideListPrint from "lib/components/plan/print/RideListPrint";
import { getPlanById } from "lib/data/plans";
import { getWorkers } from "lib/data/workers";
import { formatDateLong } from "lib/helpers/helpers";
import { ActiveJobNoPlan } from "lib/types/active-job";
import { serializePlan } from "lib/types/plan";
import React from "react";
import "/styles/print.css";

type PathProps = {
  params: {
    id: string;
  };
};

export default async function PrintPlanPage({ params }: PathProps) {
  const plan = await getPlanById(params.id);
  if (!plan) return <ErrorPage404 message="Plán nenalezen." />;
  const serialized = serializePlan(plan);
  const jobless = await getWorkers(plan.id, false);

  return (
    <>
      <div className="print-a4">
        <div className="header">
          <h1>{formatDateLong(plan.day, true)}</h1>
          <img
            src={"/logo-smj-yellow.png"}
            className="smj-logo"
            alt="SummerJob logo"
          />
        </div>

        {plan.jobs.map((job) => (
          <JobInfo job={job} jobs={plan.jobs} key={job.id}></JobInfo>
        ))}
      </div>
    </>
  );
}

function JobInfo({
  job,
  jobs,
}: {
  job: ActiveJobNoPlan;
  jobs: ActiveJobNoPlan[];
}) {
  const otherJobs = jobs.filter((j) => j.id !== job.id);
  return (
    <div className="rounded-border">
      <h2>{job.proposedJob.name}</h2>
      <p>{job.publicDescription}</p>
      <p>{job.proposedJob.area.description}</p>
      <div>
        <i className="fas fa-user-group me-1"></i>
        {job.workers
          .map<React.ReactNode>((w) =>
            w.id === job.responsibleWorkerId ? (
              <u key={`resp-worker-${w.id}`}>
                {w.firstName} {w.lastName}
              </u>
            ) : (
              <span key={`worker-${w.id}`}>
                {w.firstName} {w.lastName}
              </span>
            )
          )
          .reduce((prev, curr) => [prev, ", ", curr])}
      </div>
      <div>
        <i className="fas fa-house me-1"></i>
        {job.proposedJob.address}, {job.proposedJob.area.name}
      </div>
      <div>
        <i className="fas fa-phone me-1"></i>
        {job.proposedJob.contact}
      </div>

      <div>
        <i className="fas fa-utensils me-1"></i>
        {job.proposedJob.hasFood ? "Ano" : "Ne"}
        <span className="ms-3 me-3"></span>
        <i className="fas fa-shower me-1"></i>
        {job.proposedJob.hasShower ? "Ano" : "Ne"}
      </div>
      <div>
        <b>Doprava: </b>
        <RideListPrint job={job} otherJobs={otherJobs} />
      </div>
    </div>
  );
}
