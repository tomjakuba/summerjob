import { getSMJSession } from "lib/auth/auth";
import ErrorPage404 from "lib/components/404/404";
import EditBox from "lib/components/forms/EditBox";
import EditWorker from "lib/components/worker/EditWorker";
import { getAllergies } from "lib/data/allergies";
import { cache_getActiveSummerJobEvent } from "lib/data/cache";
import { getWorkerById } from "lib/data/workers";
import { translateAllergies, serializeAllergies } from "lib/types/allergy";
import { serializeWorker } from "lib/types/worker";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const session = await getSMJSession();
  const worker = await getWorkerById(session!.userID);
  if (!worker) {
    return <ErrorPage404 message="Pracant nenalezen." />;
  }
  const serializedWorker = serializeWorker(worker);
  const allergies = await getAllergies();
  const translatedAllergens = translateAllergies(allergies);
  const serializedAllergens = serializeAllergies(translatedAllergens);
  const summerJobEvent = await cache_getActiveSummerJobEvent();
  const { startDate, endDate } = summerJobEvent!;

  return (
    <>
      <section className="mb-3">
        <EditBox>
          <EditWorker
            serializedWorker={serializedWorker}
            serializedAllergens={serializedAllergens}
            eventStartDate={startDate.toJSON()}
            eventEndDate={endDate.toJSON()}
            isProfilePage={true}
          />
        </EditBox>
      </section>
    </>
  );
}
