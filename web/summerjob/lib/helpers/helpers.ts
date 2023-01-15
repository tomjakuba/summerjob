export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatDateLong = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  return capitalizeFirstLetter(
    new Intl.DateTimeFormat("cs-CZ", options).format(date)
  );
};
