import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { FarcasterClient } from "./client";
import { CastId } from "./types";
import { Agent } from "../../agent";
import { EventEmitter } from "stream";
import { tool } from "@langchain/core/tools";
import { castToolsSchema } from "../schema";
import { sseManager } from "../../utils/eventManager";

class FarcasterManager extends EventEmitter {
  client: FarcasterClient;
  agent: Agent;

  constructor({ neynarApiKey, agent }: { neynarApiKey: string; agent: Agent }) {
    super();
    this.agent = agent;
    const neynarConfig = new Configuration({
      apiKey: neynarApiKey,
    });

    const neynarClient = new NeynarAPIClient(neynarConfig);

    this.client = new FarcasterClient({
      neynar: neynarClient,
    });
  }

  async initialize() {
    if (!this.agent) {
      throw new Error("Agent instance is required");
    }

    if (!this.agent.params.signerUUID) {
      if (
        !this.agent.params?.username ||
        !this.agent.params?.displayName ||
        !this.agent?.params.bio
      ) {
        throw new Error("Username, display name and bio are required");
      }
      await this.client.createAccount({
        fname: this.agent.params.username,
        displayName: this.agent.params.displayName,
        bio: this.agent.params.bio,
        privateKey: this.agent.params.privateKey,
      });

      this.agent.params.signerUUID = this.client.signerUUID;
      console.log("signer uuid", this.client.signerUUID);
    }

    this.client.signerUUID = this.agent.params.signerUUID;
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

// export const castManager = new FarcasterManager({
//   neynarApiKey: process.env.NEYNAR_API_KEY!,
// });

export const exportFarcasterTools = (agent: Agent) => {
  const castManager = new FarcasterManager({
    neynarApiKey: process.env.NEYNAR_API_KEY!,
    agent,
  });

  return castManager.initialize().then(() => {
    castManager.addListener("tool", (event) => {
      if (global.currentThreadId) {
        sseManager.emitToolEvent(global.currentThreadId, event);
      }
    });

    const castTools = {
      publishSingleCast: tool(async (input) => {
        return await castManager.publishSingleCast(
          input.cast,
          input.parentCastId
        );
      }, castToolsSchema.publishCast),
    };
    return {
      tools: Object.values(castTools),
      schema: castToolsSchema,
    };
  });
};
