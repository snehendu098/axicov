import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/client";
import { defineChain } from "thirdweb";

const Page = () => {
  return (
    <ConnectButton
      client={client}
      chains={[defineChain(57054), defineChain(146)]}
    />
  );
};

export default Page;
