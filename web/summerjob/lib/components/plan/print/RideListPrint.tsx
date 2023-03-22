import { ActiveJobNoPlan } from "lib/types/active-job";
import { RideComplete } from "lib/types/ride";

interface RideListPrintProps {
  job: ActiveJobNoPlan;
  otherJobs: ActiveJobNoPlan[];
}

export default function RideListPrint({ job, otherJobs }: RideListPrintProps) {
  if (!job.rides || job.rides.length == 0) {
    if (!job.proposedJob.area.requiresCar) {
      return (
        <span className="text-muted">Tato oblast nevyžaduje dopravu.</span>
      );
    }
    return <span className="text-muted">Zatím nejsou naplánovány jízdy.</span>;
  }

  const formatSingleRide = (ride: RideComplete, index: number) => {
    const passengersFromOtherJobsIds = ride.passengers
      .filter((p) => !job.workers.map((w) => w.id).includes(p.id))
      .map((p) => p.id);
    const passengersFromOtherJobsData = [];
    for (const otherJob of otherJobs) {
      const workersInThisRide = otherJob.workers.filter((w) =>
        passengersFromOtherJobsIds.includes(w.id)
      );
      if (workersInThisRide.length == 0) continue;
      passengersFromOtherJobsData.push({
        jobName: otherJob.proposedJob.name,
        passengers: workersInThisRide,
      });
    }
    const passengersFromThisJob = ride.passengers
      .filter((p) => job.workers.map((w) => w.id).includes(p.id))
      .map((p) => `${p.firstName} ${p.lastName}`);
    const passengersFromThisJobString =
      [passengersFromThisJob].join(", ") || "-";
    return (
      <>
        <div className="row">
          <div className="col-auto pe-0">
            {index + 1}
            {")"} {ride.car.name}: {ride.driver.firstName}{" "}
            {ride.driver.lastName} (obsazenost: {ride.passengers.length + 1}/
            {ride.car.seats})
          </div>
        </div>
        <div className="ms-2">
          Z tohoto jobu jede: {passengersFromThisJobString}
        </div>
        {passengersFromOtherJobsData.length > 0 && (
          <div className="ms-2">
            Navíc odváží:{" "}
            {passengersFromOtherJobsData
              .map<React.ReactNode>((data) => (
                <span key={`rideinfo-${ride.id}-${data.jobName}`}>
                  <i>{data.jobName}: </i>

                  {data.passengers
                    .map((p) => `${p.firstName} ${p.lastName}`)
                    .join(", ")}
                </span>
              ))
              .reduce((prev, curr) => [prev, ", ", curr])}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="ms-1">
      {job.rides.map((r, index) => (
        <span key={r.id}>{formatSingleRide(r, index)}</span>
      ))}
    </div>
  );
}
