import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { FarcasterClient } from "./client";
import { CastId } from "./types";
import { tool } from "@langchain/core/tools";
import { castToolsSchema } from "../schema";
import chalk from "chalk";

class FarcasterManager {
  client: FarcasterClient;
  private signerUUid: string;

  constructor({
    signerUUID,
    neynarApiKey,
  }: {
    signerUUID: string;
    neynarApiKey: string;
  }) {
    this.signerUUid = signerUUID;
    const neynarConfig = new Configuration({
      apiKey: neynarApiKey,
    });

    const neynarClient = new NeynarAPIClient(neynarConfig);

    this.client = new FarcasterClient({
      neynar: neynarClient,
      signerUUID: this.signerUUid,
    });
  }

  // Simple farcaster cast posting tool
  async publishSingleCast(cast: string, parentCastId?: CastId | undefined) {
    if (!parentCastId) {
      parentCastId = undefined;
    }

    const res = await this.client.publishCast(cast, parentCastId);

    return res;
  }
}

export const castManager = new FarcasterManager({
  signerUUID: process.env.FARCASTER_SIGNER_UUID!,
  neynarApiKey: process.env.NEYNAR_API_KEY!,
});

export const castTools = {
  publishSingleCast: tool(async (input) => {
    console.log(chalk.green(input.cast));

    return await castManager.publishSingleCast(input.cast, input.parentCastId);
  }, castToolsSchema.publishCast),
};
