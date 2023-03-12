import EditBox from "lib/components/forms/EditBox";
import CreateProposedJobForm from "lib/components/jobs/CreateProposedJobForm";
import { getAllergies } from "lib/data/allergies";
import { getAreas } from "lib/data/areas";
import { translateAllergies, serializeAllergies } from "lib/types/allergy";
import { serializeAreas } from "lib/types/areas";

export const dynamic = "force-dynamic";

export default async function CreateProposedJobPage() {
  const areas = await getAreas();
  const serializedAreas = serializeAreas(areas);
  const allergies = await getAllergies();
  const translatedAllergens = translateAllergies(allergies);
  const serializedAllergens = serializeAllergies(translatedAllergens);
  return (
    <EditBox>
      <CreateProposedJobForm
        serializedAreas={serializedAreas}
        serializedAllergens={serializedAllergens}
      />
    </EditBox>
  );
}
