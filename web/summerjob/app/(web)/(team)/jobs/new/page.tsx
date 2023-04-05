import ErrorPage404 from "lib/components/404/404";
import EditBox from "lib/components/forms/EditBox";
import CreateProposedJobForm from "lib/components/jobs/CreateProposedJobForm";
import { getAllergies } from "lib/data/allergies";
import { getAreas } from "lib/data/areas";
import { cache_getActiveSummerJobEvent } from "lib/data/cache";
import { translateAllergies, serializeAllergies } from "lib/types/allergy";
import { serializeAreas } from "lib/types/area";

export const dynamic = "force-dynamic";

export default async function CreateProposedJobPage() {
  const areas = await getAreas();
  const serializedAreas = serializeAreas(areas);
  const allergies = await getAllergies();
  const translatedAllergens = translateAllergies(allergies);
  const serializedAllergens = serializeAllergies(translatedAllergens);
  const summerJobEvent = await cache_getActiveSummerJobEvent();
  const { startDate, endDate } = summerJobEvent!;
  return (
    <EditBox>
      <CreateProposedJobForm
        serializedAreas={serializedAreas}
        serializedAllergens={serializedAllergens}
        eventStartDate={startDate.toJSON()}
        eventEndDate={endDate.toJSON()}
      />
    </EditBox>
  );
}
