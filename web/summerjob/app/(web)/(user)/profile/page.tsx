import ErrorPage404 from "lib/components/404/404";
import EditBox from "lib/components/forms/EditBox";
import EditProfile from "lib/components/profile/EditProfile";
import { getAllergies } from "lib/data/allergies";
import { cache_getActiveSummerJobEvent } from "lib/data/cache";
import { getWorkerById, getWorkers } from "lib/data/workers";
import { translateAllergies, serializeAllergies } from "lib/types/allergy";
import { serializeWorker } from "lib/types/worker";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  // TODO: replace with ID from session
  const workers = await getWorkers();
  if (workers.length === 0) {
    return <ErrorPage404 message="Žádní pracanti nejsou zaregistrováni." />;
  }
  const worker = await getWorkerById(workers[0].id);
  // ^^^^^^^^^^^^^^
  if (!worker) {
    return <ErrorPage404 message="Pracant nenalezen." />;
  }
  const serializedWorker = serializeWorker(worker);
  const allergies = await getAllergies();
  const translatedAllergens = translateAllergies(allergies);
  const serializedAllergens = serializeAllergies(translatedAllergens);
  const summerJobEvent = await cache_getActiveSummerJobEvent();
  if (!summerJobEvent) {
    return <ErrorPage404 message="Není nastaven aktivní SummerJob ročník." />;
  }
  const { startDate, endDate } = summerJobEvent;

  return (
    <>
      <section className="mb-3">
        <EditBox>
          <EditProfile
            serializedWorker={serializedWorker}
            serializedAllergens={serializedAllergens}
            eventStartDate={startDate.toJSON()}
            eventEndDate={endDate.toJSON()}
          />
        </EditBox>
      </section>
    </>
  );
}
