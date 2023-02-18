export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatDateLong = (date: Date, capitalize: boolean) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  const formatted = new Intl.DateTimeFormat("cs-CZ", options).format(date);
  return capitalize ? capitalizeFirstLetter(formatted) : formatted;
};

export function filterUniqueById<T extends { id: string }>(elements: T[]): T[] {
  return Array.from(new Map(elements.map((item) => [item.id, item])).values());
}
