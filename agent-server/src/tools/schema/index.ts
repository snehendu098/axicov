import { z } from "zod";
import { CastIdSchema } from "../farcaster/types";
import { Tools } from "../../types";

export const baseToolSchema: Tools = {
  deployTokenSchema: {
    name: "tokenDeployer",
    description: `
      Deploys an ERC-20 token on the base blockchain based on tokenName, tokenSymbol and tokenSupply

       **IMPORTANT INSTRUCTIONS**:
       - Don't invent the token symbol, token name, initial supply of the token. These must be provided by the user itself

       **EXAMPLES**
       User: Deploy a token
       You: Please provide the token symbol, token name and initial supply of the token
      `,
    schema: z.object({
      tokenName: z.string().describe("The name of the token"),
      tokenSymbol: z.string().describe("The symbol of the token"),
      tokenSupply: z.number().describe("The initial total supply of the token"),
    }),
    requiresApproval: true,
  },
  getBalanceOfTokenSchema: {
    name: "tokenBalanceFetcher",
    description:
      "Gets the balance of an ERC-20 token by taking the address of that token as input",
    schema: z.object({
      tokenAddress: z.string().describe("The address of the token"),
    }),
  },
  getNativeTokenBalance: {
    name: "nativeETHBalanceFetcher",
    description: `Gets the native ETH balance of the user's address. 
      
      **NOTE**: This tool is used by default when the user asks the agent to tell the user's wallet balance`,
    schema: undefined,
  },
};

export const castToolsSchema: Tools = {
  publishCast: {
    name: "publishCast",
    description: `Publishes a cast on farcaster
      **NOTE**: 
      - Farcaster is a decentralized socaial media platform 

      **IMPORTANT POINTS**
      - The cast content should look like a structured post
      - Make sure that the content is complete and doesn't need any human to add more details in it
      - If you think there is something that needs human intervention, make sure to invent the details yourself
      - **PARENT CAST ID IS NOT REQUIRED RIGHT NOW AS THIS IS STILL UNDER DEVELOPEMENT**
      - **THE RESPONSE FOROM AGENT MUST INCLUDE CAST HASH**

      **EXAMPLE**
      input: Create a cast about my latest token launch
      Cast content: 
      I recently launched a token on the base network

      Here's its contract address: <actual contract address of token>
      `,
    schema: z.object({
      cast: z
        .string()
        .describe(
          `
        The content of the farcaster cast
        
        **THIS MUST BE IN PLAINTEXT AND NOT IN MARKDOWN FORMAT**
        **USE LINE BREAKS TO DIVIDE THE CONTENT AND MAKE IT LOOK NICE AND MORE READABLE**
        `
        )
        .max(320),
      parentCastId: CastIdSchema.optional().describe(
        `The parent cast id of the current cast`
      ),
    }),
  },
};
