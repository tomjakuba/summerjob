const dictionary: Record<string, string> = {
  DB_CONNECT_ERROR: "Nelze se připojit k databázi.",
  ALLERGY_DUST: "Prach",
  ALLERGY_POLLEN: "Pyl",
  ALLERGY_ANIMALS: "Zvířata",
  ALLERGY_GRASS: "Tráva",
};

export default function translate(key: string): string {
  return dictionary[key] || key;
}
