export const formatChainName = (name: string) => {
  const formattedName = name.split(" ")[0].toLowerCase();
  if (formattedName === "gesoten") {
    return "geso";
  } else if (formattedName === "amoy") {
    return "polygon";
  }
  return formattedName;
};

export function formatAddress(address: string): string {
  if (address && address.length > 9) {
    return `${address.substring(0, 5)}...${address.substring(address.length - 4)}`;
  }
  return address;
}