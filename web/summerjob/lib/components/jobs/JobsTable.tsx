import { useAPIProposedJobUpdateDynamic } from "lib/fetcher/proposed-job";
import { ProposedJobComplete } from "lib/types/proposed-job";
import Link from "next/link";
import { ProposedJobAPIPatchData } from "pages/api/proposed-jobs/[id]";
import { useEffect, useMemo, useState } from "react";
import { ExpandableRow } from "../table/ExpandableRow";
import { LoadingRow } from "../table/LoadingRow";
import {
  SortableColumn,
  SortableTable,
  SortOrder,
} from "../table/SortableTable";

const _columns: SortableColumn[] = [
  { id: "name", name: "Název", sortable: true },
  { id: "area", name: "Lokalita", sortable: true },
  { id: "contact", name: "Kontaktní osoba", sortable: false },
  { id: "address", name: "Adresa", sortable: false },
  { id: "days", name: "Naplánované dny", sortable: true },
  { id: "workers", name: "Počet pracovníků", sortable: true },
  { id: "actions", name: "Akce", sortable: false },
];

interface JobsTableProps {
  data: ProposedJobComplete[];
  shouldShowJob: (job: ProposedJobComplete) => boolean;
  reload: () => void;
}

type JobUpdateData = {
  id: string;
  data: ProposedJobAPIPatchData;
};

export function JobsTable({ data, shouldShowJob, reload }: JobsTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>({
    columnId: undefined,
    direction: "desc",
  });
  const onSortRequested = (direction: SortOrder) => {
    setSortOrder(direction);
  };
  const [waitingJobs, completedJobs, pinnedJobs] = useMemo(() => {
    const completed = data.filter((job) => job.completed);
    const pinned = data.filter((job) => !job.completed && job.pinned);
    const regular = data.filter((job) => !job.completed && !job.pinned);
    return [regular, completed, pinned];
  }, [data]);

  const sortedData = useMemo(
    () => [
      ...sortJobs(pinnedJobs, sortOrder),
      ...sortJobs(waitingJobs, sortOrder),
      ...sortJobs(completedJobs, sortOrder),
    ],
    [sortOrder, waitingJobs, completedJobs]
  );

  const [jobUpdateData, setJobUpdateData] = useState<JobUpdateData | undefined>(
    undefined
  );
  const getUpdateJobId = () => jobUpdateData?.id;
  const { trigger } = useAPIProposedJobUpdateDynamic(getUpdateJobId, {
    onSuccess: () => {
      reload();
    },
  });

  useEffect(() => {
    if (jobUpdateData) {
      trigger(jobUpdateData.data);
      setJobUpdateData(undefined);
    }
  }, [jobUpdateData, setJobUpdateData, trigger]);

  const setJobPinned = (job: ProposedJobComplete, pinned: boolean) => {
    setJobUpdateData({
      id: job.id,
      data: { pinned: pinned },
    });
  };

  const setJobCompleted = (job: ProposedJobComplete, completed: boolean) => {
    setJobUpdateData({
      id: job.id,
      data: { completed: completed },
    });
  };

  return (
    <SortableTable
      columns={_columns}
      currentSort={sortOrder}
      onRequestedSort={onSortRequested}
    >
      {data &&
        sortedData.map(
          (job) =>
            shouldShowJob(job) && (
              <ExpandableRow
                key={job.id}
                data={formatJobRow(job, setJobPinned, setJobCompleted)}
                className={rowColorClass(job)}
              >
                <>
                  <div className="ms-2">
                    <h6>Popis</h6>
                    <p>{job.description}</p>
                    <p>
                      <strong>Počet pracovníků: </strong>
                      {job.minWorkers} - {job.maxWorkers} ({job.strongWorkers}{" "}
                      siláků)
                    </p>
                    <p>
                      <strong>Doprava do oblasti požadována: </strong>
                      {job.area.requiresCar ? "Ano" : "Ne"}
                    </p>
                    <p>
                      <strong>Naplánované dny: </strong>
                      {job.activeJobs.length} / {job.requiredDays}
                    </p>
                  </div>
                </>
              </ExpandableRow>
            )
        )}
    </SortableTable>
  );
}

function rowColorClass(job: ProposedJobComplete) {
  if (job.completed) {
    return "smj-completed-job-row";
  }
  if (job.pinned) {
    return "smj-pinned-job-row";
  }
  return "";
}

function formatJobRow(
  job: ProposedJobComplete,
  setPinned: (job: ProposedJobComplete, pinned: boolean) => void,
  setCompleted: (job: ProposedJobComplete, completed: boolean) => void
) {
  return [
    job.name,
    job.area.name,
    job.contact,
    job.address,
    `${job.activeJobs.length} / ${job.requiredDays}`,
    `${job.minWorkers} - ${job.maxWorkers}`,
    <span
      key={job.id}
      className="d-flex align-items-center gap-3 smj-table-actions-cell"
    >
      {markJobAsCompletedIcon(job, setCompleted)}
      {pinJobIcon(job, setPinned)}
      <Link href={`/jobs/${job.id}`} onClick={(e) => e.stopPropagation()}>
        <i className="fas fa-edit" title="Upravit"></i>
      </Link>
      <i className="fas fa-trash-alt smj-action-delete" title="Smazat"></i>
    </span>,
  ];
}

function markJobAsCompletedIcon(
  job: ProposedJobComplete,
  setCompleted: (job: ProposedJobComplete, completed: boolean) => void
) {
  const color = job.completed ? "smj-action-completed" : "smj-action-complete";
  const title = job.completed
    ? "Označit jako nedokončený"
    : "Označit jako dokončený";
  const icon = job.completed ? "fa-times" : "fa-check";
  return (
    <i
      className={`fas ${icon} ${color}`}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        setCompleted(job, !job.completed);
      }}
    ></i>
  );
}

function pinJobIcon(
  job: ProposedJobComplete,
  setPinned: (job: ProposedJobComplete, pinned: boolean) => void
) {
  const color = job.pinned ? "smj-action-pinned" : "smj-action-pin";
  const title = job.pinned ? "Odepnout" : "Připnout";
  const icon = job.pinned ? "fa-thumbtack" : "fa-thumbtack";
  return (
    <i
      className={`fas ${icon} ${color}`}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        setPinned(job, !job.pinned);
      }}
    ></i>
  );
}

function sortJobs(data: ProposedJobComplete[], sortOrder: SortOrder) {
  if (sortOrder.columnId === undefined) {
    return data;
  }
  data = [...data];

  const getSortable: {
    [b: string]: (job: ProposedJobComplete) => string | number;
  } = {
    name: (job) => job.name,
    area: (job) => job.area.name,
    address: (job) => job.address,
    days: (job) => job.activeJobs.length,
    workers: (job) => job.minWorkers,
  };

  if (sortOrder.columnId in getSortable) {
    const sortKey = getSortable[sortOrder.columnId];
    return data.sort((a, b) => {
      if (sortKey(a) < sortKey(b)) {
        return sortOrder.direction === "desc" ? 1 : -1;
      }
      if (sortKey(a) > sortKey(b)) {
        return sortOrder.direction === "desc" ? -1 : 1;
      }
      return 0;
    });
  }
  return data;
}
