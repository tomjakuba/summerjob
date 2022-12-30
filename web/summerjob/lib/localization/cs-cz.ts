const dictionary: Record<string, string> = {
  DB_CONNECT_ERROR: "Nelze se připojit k databázi.",
};

export default function translate(key: string): string {
  return dictionary[key] || key;
}
