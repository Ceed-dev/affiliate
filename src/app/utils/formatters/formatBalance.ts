/**
 * Formats a numeric balance for display. If the balance is a whole number (no decimals),
 * it returns the balance as a string without decimal places. Otherwise, it returns the original balance string.
 * 
 * @param balance - The balance as a string that may include decimals.
 * @returns The formatted balance as a string, with or without decimal places based on the input.
 */
export const formatBalance = (balance: string): string => {
  const parsedBalance = parseFloat(balance); // Convert the balance string to a float

  // Check if the balance is a whole number (no decimal part)
  return parsedBalance % 1 === 0 ? parsedBalance.toString() : balance;
};
