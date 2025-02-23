import {
  Chain,
  createThirdwebClient,
  defineChain,
  ThirdwebClient,
} from "thirdweb";
import { Account } from "thirdweb/dist/types/wallets/interfaces/wallet";
import { privateKeyToAccount } from "thirdweb/wallets";
import Web3 from "web3";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { tool } from "@langchain/core/tools";
import { baseToolSchema } from "../schema";
import chalk from "chalk";
import { toolType } from "../../types";
import { EventEmitter } from "events";
import { sseManager } from "../../utils/eventManager";
import { Agent } from "../../agent";

export class BlockchainClass extends EventEmitter {
  public web3: Web3;
  public client: ThirdwebClient;
  public account: Account;
  public chain: Chain;
  private clientId?: string;
  public sdk;
  public agent: Agent | undefined;

  constructor({
    network,
    thirdwebAPIKey,
    clientId,
    agent,
  }: {
    network: "testnet" | "mainnet";
    agent: Agent;
    thirdwebAPIKey?: string;
    clientId?: string;
  }) {
    super();

    this.agent = agent;

    if (!this.agent) {
      throw new Error("Agent needs to be present");
    }

    if (!thirdwebAPIKey && !process.env.THIRDWEB_SECRET) {
      throw new Error("Thirdweb secret needed");
    }

    if (!this.agent.params?.privateKey) {
      throw new Error("Private key is required");
    }

    if (process.env.THIRDWEB_CLIENT_ID || clientId) {
      this.clientId = process.env.THIRDWEB_CLIENT_ID || clientId;
    }

    if (network === "mainnet") {
      const cId = 8453;
      this.web3 = new Web3(
        `https://${cId}.rpc.thirdweb.com/${
          process.env.THIRDWEB_SECRET! || thirdwebAPIKey
        }`
      );
      this.chain = defineChain(cId);
    } else {
      const cId = 84532;
      this.web3 = new Web3(
        `https://${cId}.rpc.thirdweb.com/${
          process.env.THIRDWEB_SECRET! || thirdwebAPIKey
        }`
      );
      this.chain = defineChain(cId);
    }

    this.sdk = ThirdwebSDK.fromPrivateKey(
      this.agent.params.privateKey as string,
      this.chain.rpc,
      {
        clientId: this.clientId,
        secretKey: (process.env.THIRDWEB_SECRET || thirdwebAPIKey) as string,
      }
    );

    this.client = createThirdwebClient({
      secretKey: (process.env.THIRDWEB_SECRET || thirdwebAPIKey) as string,
    });

    this.account = privateKeyToAccount({
      client: this.client,
      privateKey: this.agent.params.privateKey as string,
    });

    console.log(
      "Agent wallet address:",
      chalk.blueBright(this.account.address)
    );
  }

  async initialize() {
    // Save something to the agent params

    if (!this.agent) {
      throw new Error("Agent instance is required");
    }

    if (!this.agent?.params.publicKey) {
      this.agent.params["publicKey"] = this.account.address;
    }
    return this.agent?.params;
  }

  async deployToken(
    tokenName: string,
    tokenSymbol: string,
    tokenSupply: number
  ) {
    try {
      console.log(chalk.green(tokenName, tokenSymbol, tokenSupply));
      console.log(chalk.bgGray("Deploying token"));

      const deployedAddress = await this.sdk.deployer.deployToken({
        name: tokenName,
        symbol: tokenSymbol,
        defaultAdmin: this.account.address,
      });
      console.log(
        chalk.bgGray(
          `Deployed at address ${deployedAddress}, Minting tokens to wallet`
        )
      );
      this.emit("toolEvent", {
        tool: "blockchain",
        status: "COMPLETE",
        message: `Deployed at address ${deployedAddress}, Minting tokens to wallet`,
        timestamp: new Date().toISOString(),
      });

      const tokenContract = await this.sdk.getContract(
        deployedAddress,
        "token"
      );
      const mintTxn = await tokenContract.mintTo(
        this.account.address,
        tokenSupply
      );

      console.log(chalk.bgGray(`Minted tokens: ${mintTxn.receipt.blockHash}`));
      this.emit("toolEvent", {
        tool: "blockchain",
        status: "COMPLETE",
        message: `Minted tokens: ${mintTxn.receipt.blockHash}`,
      });

      return { token: deployedAddress, mintTxnHash: mintTxn.receipt.blockHash };
    } catch (err: any) {
      throw new Error(`Error Occurred: ${err}`);
    }
  }

  async getBalanceOfToken(tokenAddress: string) {
    try {
      const tokenContract = await this.sdk.getContract(tokenAddress, "token");
      return tokenContract.balanceOf(this.account.address);
    } catch (err: any) {
      console.log(chalk.red(err[0]));
      throw new Error(`Error Occurred: ${err}`);
    }
  }

  async getNativeTokenBalance() {
    try {
      console.log(chalk.bgGray("Fetching native token balance"));
      this.emit("toolEvent", {
        tool: "blockchain",
        status: "FETCHING",
        message: `Getting native token balance`,
        timestamp: new Date().toISOString(),
      });
      return this.sdk.getBalance(this.account.address);
    } catch (err: any) {
      throw new Error(`Error Occurred: ${err}`);
    }
  }
}

export const exportBlockchainTools = async (agent: Agent) => {
  const blockchainInstance = new BlockchainClass({
    network: (process.env.NETWORK || "testnet") as "testnet" | "mainnet",
    agent,
  });

  blockchainInstance.initialize();

  blockchainInstance.addListener("toolEvent", (event) => {
    if (global.currentThreadId) {
      sseManager.emitToolEvent(global.currentThreadId, event);
    }
  });

  const blockchainTools: {
    [key: string]: toolType;
  } = {
    deployToken: tool(async (input) => {
      return await blockchainInstance.deployToken(
        input.tokenName,
        input.tokenSymbol,
        input.tokenSupply
      );
    }, baseToolSchema.deployTokenSchema),

    getBalanceOfToken: tool(async (input) => {
      return await blockchainInstance.getBalanceOfToken(input.tokenAddress);
    }, baseToolSchema.getBalanceOfTokenSchema),

    getNativeTokenBalance: tool(async () => {
      return await blockchainInstance.getNativeTokenBalance();
    }, baseToolSchema.getNativeTokenBalance),
  };

  return {
    tools: Object.values(blockchainTools),
    schema: baseToolSchema,
  };
};
