import ErrorPage from "lib/components/error-page/error";
import PlansClientPage from "lib/components/plan/PlansClientPage";
import { getPlans } from "lib/data/plans";
import { getActiveSummerJobEvent } from "lib/data/summerjob-event";
import { serializePlans } from "lib/types/plan";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const plans = await getPlans();
  const serialized = serializePlans(plans);
  const summerJobEvent = await getActiveSummerJobEvent();
  if (summerJobEvent)
    return (
      <ErrorPage
        error={"Nelze zobrazit plány - není nastaven aktivní ročník."}
      />
    );
  return <PlansClientPage initialData={serialized} />;
}
