import EditBox from "lib/components/forms/EditBox";
import CreateWorker from "lib/components/worker/CreateWorker";
import { getAllergies } from "lib/data/allergies";
import { cache_getActiveSummerJobEvent } from "lib/data/cache";
import { translateAllergies, serializeAllergies } from "lib/types/allergy";

export default async function EditWorkerPage() {
  const allergies = await getAllergies();
  const translatedAllergens = translateAllergies(allergies);
  const serializedAllergens = serializeAllergies(translatedAllergens);
  const summerJobEvent = await cache_getActiveSummerJobEvent();
  const { startDate, endDate } = summerJobEvent!;

  return (
    <>
      <section className="mb-3">
        <EditBox>
          <CreateWorker
            serializedAllergens={serializedAllergens}
            eventStartDate={startDate.toJSON()}
            eventEndDate={endDate.toJSON()}
          />
        </EditBox>
      </section>
    </>
  );
}
