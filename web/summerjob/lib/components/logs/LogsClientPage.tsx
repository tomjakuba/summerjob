import { Logging } from "lib/prisma/client";
import LogsTable from "./LogsTable";
import { deserializeLogs } from "lib/types/logger";
import { Serialized } from "lib/types/serialize";

interface LogsClientPageProps {
  sLogs: Serialized<Logging[]>;
}

export default function LogsClientPage({ sLogs }: LogsClientPageProps) {
  const logs = deserializeLogs(sLogs);
  return (
    <section>
      <div className="container">
        <div className="text-wrap">
          <LogsTable logs={logs} />
        </div>
      </div>
    </section>
  );
}
