/**
 * Formats a date with the browser's local time zone and returns the formatted string.
 * If the date is undefined, it returns "Date not set".
 * 
 * @param date - The date object to format.
 * @returns The formatted date string including the time zone.
 */
export const displayFormattedDateWithTimeZone = (date: Date | undefined): string => {
  if (!date) {
    return "Date not set"; // Handle undefined date case
  }

  // Date formatting options, including time zone and detailed time
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  };

  // Format the date using the browser's locale and time zone
  return date.toLocaleString(undefined, options);
};

/**
 * Calculates and returns the date of the next payment, which is the 1st of the next month.
 * The date is adjusted to Japan Standard Time (JST) and then displayed in the user's time zone.
 * 
 * @returns The date for the next payment.
 */
export const getNextPaymentDate = (): Date => {
  const now = new Date(); // Get the current date and time
  const year = now.getUTCFullYear(); // Current year
  const nextMonth = now.getUTCMonth() + 1; // Set to next month

  // Set the 1st of the next month in UTC
  const utcNextPaymentDate = new Date(Date.UTC(year, nextMonth, 1, 0, 0, 0));

  // Japan Standard Time (JST) offset is +9 hours from UTC
  const jstNextPaymentDate = new Date(utcNextPaymentDate.getTime() + (9 * 60 * 60 * 1000));

  // Return the date
  return jstNextPaymentDate;
};

/**
 * Retrieves the user's current time zone symbol (e.g., "America/Los_Angeles").
 * 
 * @returns The user's time zone as a string.
 */
export const getTimeZoneSymbol = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
