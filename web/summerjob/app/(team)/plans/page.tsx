import PlansClientPage from "lib/components/plan/PlansClientPage";
import { getPlans } from "lib/data/plans";
import { serializePlans } from "lib/types/plan";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const plans = await getPlans();
  const serialized = serializePlans(plans);
  return <PlansClientPage initialData={serialized} />;
}
