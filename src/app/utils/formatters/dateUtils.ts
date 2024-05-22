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