export function formatAddress(address: string): string {
  if (address && address.length > 9) {
    return `${address.substring(0, 5)}...${address.substring(address.length - 4)}`;
  }
  return address;
}
