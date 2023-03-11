import { Allergy } from "lib/prisma/client";
// TODO support other languages
import { default as t } from "lib/localization/cs-cz";

export function serializeAllergies(data: Allergy[]) {
  return JSON.stringify(data);
}

export function deserializeAllergies(data: string) {
  return JSON.parse(data) as Allergy[];
}

export function translateAllergies(allergies: Allergy[]) {
  if (!allergies) return [];
  let result = allergies.map((allergy) => {
    return { ...allergy, code: t(allergy.code) };
  });
  result.sort((a, b) => a.code.localeCompare(b.code));
  return result;
}
