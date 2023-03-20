"use client";
import { ActiveJobNoPlan } from "lib/types/active-job";
import { RidesForJob } from "lib/types/ride";
import { useMemo } from "react";

interface ActiveJobIssueProps {
  job: ActiveJobNoPlan;
  ridesForOtherJobs: RidesForJob[];
}

export function ActiveJobIssueBanner({
  job,
  ridesForOtherJobs,
}: ActiveJobIssueProps) {
  const issues = useMemo(
    () => getIssues(job, ridesForOtherJobs),
    [job, ridesForOtherJobs]
  );
  const hasIssues = Object.values(issues).some((i) => i);
  return (
    <>
      {hasIssues && (
        <div className="ps-3 pe-3 mt-2 mb-3">
          <div className="row bg-warning rounded-3 p-2">
            <div className="col-auto d-flex align-items-center">
              <div className="fas fa-triangle-exclamation fs-5"></div>
            </div>
            <div className="col">
              {issues.tooManyWorkers && (
                <div className="row">
                  <div className="col">Na jobu je příliš mnoho pracantů.</div>
                </div>
              )}
              {issues.tooFewWorkers && (
                <div className="row">
                  <div className="col">Na jobu je nedostatek pracantů.</div>
                </div>
              )}
              {issues.notEnoughStrongWorkers && (
                <div className="row">
                  <div className="col">
                    Na jobu je nedostatek silných pracantů.
                  </div>
                </div>
              )}
              {issues.overloadedCars && (
                <div className="row">
                  <div className="col">
                    Některé naplánované jízdy jsou přeplněné.
                  </div>
                </div>
              )}
              {issues.missingResponsible && (
                <div className="row">
                  <div className="col">Není přiřazena zodpovědná osoba.</div>
                </div>
              )}
              {issues.missingRides && (
                <div className="row">
                  <div className="col">
                    Někteří pracovníci nemají přiřazenou dopravu.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ActiveJobIssueIcon({
  job,
  ridesForOtherJobs,
}: ActiveJobIssueProps) {
  const issues = useMemo(
    () => getIssues(job, ridesForOtherJobs),
    [job, ridesForOtherJobs]
  );
  const hasIssues = Object.values(issues).some((i) => i);
  return (
    <>{hasIssues && <div className="fas fa-triangle-exclamation"></div>}</>
  );
}

function getIssues(job: ActiveJobNoPlan, ridesForOtherJobs: RidesForJob[]) {
  return {
    tooManyWorkers: tooManyWorkers(job),
    tooFewWorkers: tooFewWorkers(job),
    notEnoughStrongWorkers: notEnoughStrongWorkers(job),
    overloadedCars: overloadedCars(job),
    missingResponsible: missingResponsible(job),
    missingRides: missingRides(job, ridesForOtherJobs),
  };
}

function tooManyWorkers(job: ActiveJobNoPlan) {
  return job.workers.length > job.proposedJob.maxWorkers;
}

function tooFewWorkers(job: ActiveJobNoPlan) {
  return job.workers.length < job.proposedJob.minWorkers;
}

function notEnoughStrongWorkers(job: ActiveJobNoPlan) {
  const strongWorkers = job.workers.filter((worker) => worker.isStrong);
  return strongWorkers.length < job.proposedJob.strongWorkers;
}

function overloadedCars(job: ActiveJobNoPlan) {
  const rides = job.rides.filter(
    (ride) => ride.car.seats < ride.passengers.length + 1
  );
  return rides.length > 0;
}

function missingResponsible(job: ActiveJobNoPlan) {
  return !job.responsibleWorker;
}

function missingRides(job: ActiveJobNoPlan, ridesForOtherJobs: RidesForJob[]) {
  if (!job.proposedJob.area.requiresCar) {
    return false;
  }
  const passengers = ridesForOtherJobs
    .flatMap((record) => record.rides)
    .concat(job.rides)
    .flatMap((ride) => ride.passengers)
    .map((passenger) => passenger.id);
  const drivers = job.rides.map((ride) => ride.driver.id);
  const peopleWithRides = [...passengers, ...drivers];
  const workersWithoutRides = job.workers.filter(
    (worker) => !peopleWithRides.includes(worker.id)
  );
  return workersWithoutRides.length > 0;
}
