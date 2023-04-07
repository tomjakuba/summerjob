import { UseFormRegisterReturn } from "react-hook-form";

export default function AllergyPill({
  allergy,
  register,
}: {
  allergy: string;
  register: () => UseFormRegisterReturn;
}) {
  return (
    <div className="d-inline-block me-3">
      <input
        id={allergy}
        className="btn-check"
        type="checkbox"
        value={allergy}
        {...register()}
      />
      <label
        className="form-label btn-light btn p-2 allergy-checkbox-label"
        htmlFor={allergy}
      >
        {allergy}
      </label>
    </div>
  );
}
