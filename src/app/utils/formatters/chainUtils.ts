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
