/**
 * Formats a blockchain name by splitting at the first space and converting to lowercase.
 * Special cases for "gesoten" and "amoy" are handled.
 * 
 * @param name - The original chain name.
 * @returns The formatted chain name.
 */
export const formatChainName = (name: string): string => {
  const formattedName = name.split(" ")[0].toLowerCase();
  
  // Handle special cases for specific chain names
  switch (formattedName) {
    case "gesoten":
      return "geso";
    case "amoy":
      return "polygon";
    default:
      return formattedName;
  }
};

/**
 * Formats an address by showing the first 5 and last 4 characters, separated by "...".
 * If the address is shorter than 9 characters, it is returned as is.
 * 
 * @param address - The full address string.
 * @returns The formatted address.
 */
export function formatAddress(address: string): string {
  return (address && address.length > 9) 
    ? `${address.substring(0, 5)}...${address.substring(address.length - 4)}` 
    : address;
}

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
