export function shortenAddress(address?: string, length: number = 4): string {
    if (!address) return "";
    if (address.length < 2 * length + 2) return address;
    return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}