import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/client";
import { defineChain } from "thirdweb";

export const ConfiguredConnect = () => {
  return (
    <ConnectButton
      client={client}
      chains={[defineChain(57054), defineChain(146)]}
    />
  );
};
