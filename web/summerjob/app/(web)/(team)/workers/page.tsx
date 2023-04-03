import { withPermissions } from "lib/auth/auth";
import AccessDeniedPage from "lib/components/error-page/AccessDeniedPage";
import WorkersClientPage from "lib/components/worker/WorkersClientPage";
import { getWorkers } from "lib/data/workers";
import { Permission } from "lib/types/auth";
import { serializeWorkers } from "lib/types/worker";

export const dynamic = "force-dynamic";

export default async function WorkersPage() {
  const isAllowed = await withPermissions([Permission.WORKERS]);
  if (!isAllowed.success) {
    return <AccessDeniedPage />;
  }
  const workers = await getWorkers();
  const sWorkers = serializeWorkers(workers);

  return <WorkersClientPage sWorkers={sWorkers} />;
}
