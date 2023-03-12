import { ProposedJobComplete } from "lib/types/proposed-job";
import { useMemo, useState } from "react";
import {
  SortableColumn,
  SortableTable,
  SortOrder,
} from "../table/SortableTable";
import ProposedJobRow from "./ProposedJobRow";

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
    [sortOrder, waitingJobs, completedJobs, pinnedJobs]
  );

  const reloadJobs = () => {
    reload();
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
              <ProposedJobRow key={job.id} job={job} reloadJobs={reloadJobs} />
            )
        )}
    </SortableTable>
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
