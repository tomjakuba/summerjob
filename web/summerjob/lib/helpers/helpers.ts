export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatDateLong = (date: Date, capitalize: boolean) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  };
  const formatted = new Intl.DateTimeFormat("cs-CZ", options).format(date);
  return capitalize ? capitalizeFirstLetter(formatted) : formatted;
};

export const formatDateNumeric = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  };
  const formatted = new Intl.DateTimeFormat("cs-CZ", options).format(date);
  return formatted;
};

export const formatDateShort = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "numeric",
    weekday: "short",
    day: "numeric",
    timeZone: "UTC",
  };
  return new Intl.DateTimeFormat("cs-CZ", options).format(date);
};

export function datesBetween(start: Date, end: Date) {
  const dates = [];
  for (
    let date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    dates.push(new Date(date));
  }
  return dates;
}

export function filterUniqueById<T extends { id: string }>(elements: T[]): T[] {
  return Array.from(new Map(elements.map((item) => [item.id, item])).values());
}

export function relativeTime(time: Date) {
  const TIME_PERIODS = [
    { amount: 60, name: "seconds" },
    { amount: 60, name: "minutes" },
    { amount: 24, name: "hours" },
    { amount: 7, name: "days" },
    { amount: 4.34524, name: "weeks" },
    { amount: 12, name: "months" },
    { amount: Number.POSITIVE_INFINITY, name: "years" },
  ];

  const formatter = new Intl.RelativeTimeFormat("cs", { numeric: "auto" });
  let duration = (time.getTime() - new Date().getTime()) / 1000;

  for (const period of TIME_PERIODS) {
    if (Math.abs(duration) < period.amount) {
      return formatter.format(
        Math.round(duration),
        period.name as Intl.RelativeTimeFormatUnit
      );
    }
    duration /= period.amount;
  }
}

export function datesAfterDate(dates: Date[], date: Date) {
  return dates.filter((d) => d >= date);
}
