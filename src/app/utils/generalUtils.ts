import { toast } from "react-toastify";

/**
 * Copies the specified text to the clipboard and displays a success or error message.
 *
 * @param {string} text - The text to be copied to the clipboard.
 * @param {string} successMessage - The message to display upon successful copy.
 * @param {string} errorMessage - The message to display if the copy fails.
 */
export const copyToClipboard = async (text: string, successMessage: string, errorMessage: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch (error: any) {
    toast.error(errorMessage + ": " + error.message);
  }
};

/**
 * Formats a large number into a more readable string with units.
 * 
 * This function converts large numbers into a shortened format using suffixes such as "K" for thousands, 
 * "M" for millions, and "B" for billions, ensuring readability and preventing overflow in UI elements. 
 * For example, 1234 becomes "1.23K" and 1234567 becomes "1.23M".
 * 
 * @param {number} num - The number to format.
 * @param {number} [decimals=3] - The maximum number of decimal places to include in the formatted result (default is 3).
 * @returns {string} - The formatted number with appropriate units, or the original number if below 1000.
 */
export const formatNumberWithUnits = (num: number, decimals: number = 3): string => {
  if (num < 1000) return num.toLocaleString("en-US");

  const units = ["K", "M", "B"];
  let unitIndex = -1;
  let formattedNum = num;

  while (formattedNum >= 1000 && unitIndex < units.length - 1) {
    formattedNum /= 1000;
    unitIndex++;
  }

  return `${Number(formattedNum.toFixed(decimals)).toLocaleString("en-US")}${units[unitIndex]}`;
};