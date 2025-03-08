import { z } from "zod";
import { CastIdSchema } from "../farcaster/types";
import { Tools } from "../../types";

export const blockchainToolsSchema: Tools = {
  deployTokenSchema: {
    name: "tokenDeployer",
    description: `
      Deploys an ERC-20 token on the base blockchain based on tokenName, tokenSymbol and tokenSupply

       **IMPORTANT INSTRUCTIONS**:
       - Don't invent the token symbol, token name, initial supply of the token. These must be provided by the user itself
       - Before deployment of the token, always make a confirmation from the user that the token details are correct

       **EXAMPLES**
       ------------
       User: Deploy a token
       You: Please provide the token symbol, token name and initial supply of the token

       User: Deploy a token named Silion
       You: Provide the token supply, and the token symbol

       User: Deploy a token named Silion with symbol SIL
       You: Provide the token supply

       User: 7000
       You: I'll deploy a token named Silion with symbol SIL and initial supply of 7000. Should I proceed?

       User: Yes
       You: <Deploy the token>
       ------------
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
    name: "nativeSonicBalanceFetcher",
    description: `Gets the native Sonic balance of the user's address. 
      
      **NOTE**: This tool is used by default when the user asks the agent to tell the user's wallet balance`,
    schema: undefined,
  },
};

export const castToolsSchema: Tools = {
  publishCast: {
    name: "publishCast",
    description: `
    Generates a cast and publishes a cast on farcaster

      **NOTE**: 
      - Farcaster is a decentralized socaial media platform 

      **IMPORTANT POINTS**
      - The cast content should look like a structured post
      - Make sure that the content is complete and doesn't need any human to add more details in it
      - If you think there is something that needs human intervention, make sure to invent the details yourself
      - **PARENT CAST ID IS NOT REQUIRED RIGHT NOW AS THIS IS STILL UNDER DEVELOPEMENT**
      - ALWAYS ASK THE USER FOR CONFIRMATION BEFORE PUBLISHING THE CAST

      **CAST GUIDELINES**
      The content of the cast should always be like engaging tweets

      **EXAMPLE**
      ----------------------
      Input: Create a cast about my latest token launch
      Cast content: {generate content for the post}
      You: Can you please confirm this. Here's the cast content: **{Cast Content}**

      Input: Yes, confirm this
      You: <publish cast>
      ----------------------
      Input: Create a cast about ethereum
      Cast Content: Ethereum gas fees are so low, I actually feel guilty paying so little. Thanks for making decentralized finance so accessible!
      You: Can you please confirm this. Here's the cast content: **Ethereum gas fees are so low, I actually feel guilty paying so little. Thanks for making decentralized finance so accessible!**

      Input: Can you please change this in the content to something which is not related to gas fees
      Cast Content: Love how Ethereum is almost ready to scale—just a few more years, a couple of upgrades, and maybe a sprinkle of hope. Truly the future of finance!
      You: I have modified the cast content to this: **Love how Ethereum is almost ready to scale—just a few more years, a couple of upgrades, and maybe a sprinkle of hope. Truly the future of finance!**. Shall I proceed further to cast it?

      Input: Yes
      You: <publish cast>
      ----------------------
      `,
    schema: z.object({
      cast: z
        .string()
        .describe(
          `
        The content of the farcaster cast
        
        **THIS MUST BE IN PLAINTEXT AND NOT IN MARKDOWN FORMAT**
        `
        )
        .max(320),
      parentCastId: CastIdSchema.optional().describe(
        `The parent cast id of the current cast`
      ),
    }),
  },
};
