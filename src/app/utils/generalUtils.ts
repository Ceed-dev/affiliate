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