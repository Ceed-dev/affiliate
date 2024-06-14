export const displayFormattedDateWithTimeZone = (date: Date | undefined) => {
  if (!date) {
    return "Date not set";
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",  // "numeric" or "2-digit"
    month: "long",    // "numeric", "2-digit", "long", "short", "narrow"
    day: "numeric",   // "numeric" or "2-digit"
    hour: "2-digit",  // "numeric" or "2-digit"
    minute: "2-digit", // "numeric" or "2-digit"
    second: "2-digit", // "numeric" or "2-digit"
    timeZoneName: "short" // "short" or "long"
  };
  return date.toLocaleString(undefined, options);  // "undefined" means to use the browser's local settings.
};

export const getNextPaymentDate = (): string => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const nextMonth = now.getUTCMonth() + 1; // Set next month

  // Set the 1st of the next month in UTC
  const utcNextPaymentDate = new Date(Date.UTC(year, nextMonth, 1, 0, 0, 0));

  // Convert to Japan Time (JST)
  const jstNextPaymentDate = new Date(utcNextPaymentDate.getTime() - (9 * 60 * 60 * 1000));

  // Displayed in the user's time zone
  const formattedDate = jstNextPaymentDate.toLocaleDateString();

  return formattedDate;
};

export const getTimeZoneSymbol = (): string => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timeZone;
};