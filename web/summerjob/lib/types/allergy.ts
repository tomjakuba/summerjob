import { Allergy } from "lib/prisma/client";
// TODO support other languages
import { default as t } from "lib/localization/cs-cz";
import { Serialized } from "./serialize";

export function serializeAllergies(data: Allergy[]): Serialized<Allergy> {
  return {
    data: JSON.stringify(data),
  };
}

export function deserializeAllergies(data: Serialized<Allergy>): Allergy[] {
  return JSON.parse(data.data);
}

export function translateAllergies(allergies: Allergy[]) {
  if (!allergies) return [];
  let result = allergies.map((allergy) => {
    return { ...allergy, code: t(allergy.code) };
  });
  result.sort((a, b) => a.code.localeCompare(b.code));
  return result;
}
