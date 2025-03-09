export const shortenAddress = (address: string) =>
  address && address.startsWith("0x")
    ? `${address.slice(0, 6)}...${address.slice(-3)}`
    : address;
