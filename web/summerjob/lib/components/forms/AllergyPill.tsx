import { Allergy } from "lib/prisma/client";
import { UseFormRegisterReturn } from "react-hook-form";

export default function AllergyPill({
  allergy,
  register,
}: {
  allergy: Allergy;
  register: () => UseFormRegisterReturn;
}) {
  return (
    <div className="d-inline-block me-3">
      <input
        id={allergy.id}
        className="btn-check"
        type="checkbox"
        value={allergy.id}
        {...register()}
      />
      <label className="form-label btn-light btn p-2" htmlFor={allergy.id}>
        {allergy.code}
      </label>
    </div>
  );
}
