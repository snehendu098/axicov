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
  signerUUid: string;

  constructor({
    neynar,
    signerUUID,
  }: {
    neynar: NeynarAPIClient;
    signerUUID: string;
  }) {
    this.neynar = neynar;
    this.signerUUid = signerUUID;
  }

  async publishCast(cast: string, parentCastId: CastId | undefined) {
    try {
      console.log(chalk.green(`Cast content: ${cast}`));
      const result = await this.neynar.publishCast({
        signerUuid: this.signerUUid,
        text: cast,
        parent: parentCastId?.hash,
      });

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
  }: {
    fname: string;
    displayName: string;
    bio: string;
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
      process.env.PRIVATE_KEY as `0x${string}`
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
    console.log("\nsignature: ", signature, "\n");

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
    this.signerUUid = regResponse.data.signer.signer_uuid;

    // update the account with username and displayName
    const updated = await this.updateAccount({
      displayName,
      signeruuid: this.signerUUid,
      bio: bio,
    });

    // TODO: Save the uuid to the database
    if (updated?.data.success) {
    } else {
    }
  }

  async updateAccount({
    displayName,
    signeruuid,
    bio,
  }: {
    displayName: string;
    signeruuid: string;
    bio: string;
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
