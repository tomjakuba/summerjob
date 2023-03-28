import ErrorPage404 from "lib/components/404/404";
import MyPlanClientPage from "lib/components/my-plan/MyPlanClientPage";
import { getMyPlans } from "lib/data/my-plan";
import { getWorkers, getWorkerById } from "lib/data/workers";
import { serializeMyPlans } from "lib/types/my-plan";

export const dynamic = "force-dynamic";

export default async function MyPlanPage() {
  // TODO: replace with ID from session
  const workers = await getWorkers();
  if (workers.length === 0) {
    return <ErrorPage404 message="Žádní pracanti nejsou zaregistrováni." />;
  }
  const worker = await getWorkerById(workers[0].id);
  // ^^^^^^^^^^^^^^
  const plans = await getMyPlans(worker!.id);
  return <MyPlanClientPage sPlan={serializeMyPlans(plans)} />;
}
