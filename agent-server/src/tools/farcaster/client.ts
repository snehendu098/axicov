import { NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";
import { CastId } from "./types";
import chalk from "chalk";
import axios from "axios";

import {
  ID_REGISTRY_ADDRESS,
  ViemLocalEip712Signer,
  idRegistryABI,
} from "@farcaster/hub-nodejs";
import { bytesToHex, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimism } from "viem/chains";

const publicClient = createPublicClient({
  chain: optimism,
  transport: http(),
});

const getDeadline = () => {
  const now = Math.floor(Date.now() / 1000);
  const oneHour = 60 * 60;
  return BigInt(now + oneHour);
};

export class FarcasterClient {
  neynar: NeynarAPIClient;
  signerUUID: string | undefined;

  constructor({ neynar }: { neynar: NeynarAPIClient }) {
    this.neynar = neynar;
    // this.signerUUID = undefined;
  }

  async publishCast(cast: string, parentCastId: CastId | undefined) {
    try {
      console.log(
        chalk.green(
          `Cast content: ${cast}, uuid: ${this.signerUUID}, castId ${parentCastId}`
        )
      );
      const result = await this.neynar.publishCast({
        signerUuid: this.signerUUID as string,
        text: cast,
        parent: parentCastId?.hash || undefined,
      });

      console.log("result", result);

      if (result.success) {
        return {
          hash: result.cast.text,
          authorFid: result.cast.author.fid,
          text: result.cast.text,
        };
      }
    } catch (err: any) {
      console.log(err);
      if (isApiErrorResponse(err)) {
        return { error: `Neynar Error: ${err.response.data.message}` };
      } else {
        return { error: `Error: ${err?.message}` };
      }
    }
  }

  async createAccount({
    fname,
    displayName,
    bio,
    privateKey,
  }: {
    fname: string;
    displayName: string;
    bio: string;
    privateKey: string;
  }) {
    // Step 1: Claim a new user FID
    const fidResponse = await axios.get<{ fid: number }>(
      "https://api.neynar.com/v2/farcaster/user/fid",
      { headers: { api_key: process.env.NEYNAR_API_KEY as string } }
    );
    const FID = fidResponse.data.fid;
    console.log("New User FID:", FID);

    const deadline = getDeadline();

    console.log("\ndeadline: ", deadline);

    const requestedUserAccount = privateKeyToAccount(
      privateKey as `0x${string}`
    );
    const requestedUserAccountSigner = new ViemLocalEip712Signer(
      requestedUserAccount
    );

    console.log(
      "\nrequested_user_custody_address: ",
      requestedUserAccount.address
    );

    let requestedUserNonce = await publicClient.readContract({
      address: ID_REGISTRY_ADDRESS,
      abi: idRegistryABI,
      functionName: "nonces",
      args: [requestedUserAccount.address],
    });

    let requestedUserSignature: any =
      await requestedUserAccountSigner.signTransfer({
        fid: BigInt(FID),
        to: requestedUserAccount.address as `0x${string}`,
        nonce: requestedUserNonce,
        deadline,
      });

    let signature = bytesToHex(requestedUserSignature.value);

    //register the user
    // Register the user
    const regResponse = await axios.post(
      "https://api.neynar.com/v2/farcaster/user",
      {
        // The request body goes here (not inside headers)
        deadline: Number(deadline),
        requested_user_custody_address: requestedUserAccount.address,
        fid: FID,
        signature: signature,
        fname: fname,
      },
      {
        headers: {
          api_key: process.env.NEYNAR_API_KEY as string,
          "Content-Type": "application/json",
        },
      }
    );
    this.signerUUID = regResponse.data.signer.signer_uuid;

    // update the account with username and displayName
    const updated = await this.updateAccount({
      displayName,
      signeruuid: this.signerUUID as string,
      bio: bio,
    });

    // TODO: Save the uuid to the database
    return updated?.data.success || false;
  }

  async updateAccount({
    displayName,
    signeruuid,
    bio,
    imageUrl,
  }: {
    displayName: string;
    signeruuid: string;
    bio: string;
    imageUrl?: string;
  }) {
    try {
      return await axios.patch(
        "https://api.neynar.com/v2/farcaster/user",
        {
          display_name: displayName,
          bio,
          signer_uuid: signeruuid,
        },
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": process.env.NEYNAR_API_KEY,
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  }
}
