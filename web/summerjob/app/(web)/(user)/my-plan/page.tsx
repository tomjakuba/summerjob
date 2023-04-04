import { getSMJSession } from "lib/auth/auth";
import ErrorPage404 from "lib/components/404/404";
import AccessDeniedPage from "lib/components/error-page/AccessDeniedPage";
import MyPlanClientPage from "lib/components/my-plan/MyPlanClientPage";
import { getMyPlans } from "lib/data/my-plan";
import { getWorkerById } from "lib/data/workers";
import { serializeMyPlans } from "lib/types/my-plan";

export const dynamic = "force-dynamic";

export default async function MyPlanPage() {
  const session = await getSMJSession();
  if (!session) {
    return <AccessDeniedPage />;
  }
  const worker = await getWorkerById(session.userID);
  if (!worker) {
    return <ErrorPage404 message="Pracant nenalezen." />;
  }
  const plans = await getMyPlans(worker.id);
  return <MyPlanClientPage sPlan={serializeMyPlans(plans)} />;
}
