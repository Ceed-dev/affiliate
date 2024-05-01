/**
 * Formats a numeric balance for display. If the balance is a whole number,
 * it converts it to a string without decimal places. If not, it returns the original balance string.
 * @param balance The balance as a string that potentially includes decimals.
 * @returns The formatted balance as a string.
 */
export const formatBalance = (balance: string): string => {
  const parsedBalance = parseFloat(balance);
  return parsedBalance % 1 === 0 ? parsedBalance.toString() : balance;
};