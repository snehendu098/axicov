// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { ChatAnthropic } from "@langchain/anthropic";
// import { SystemMessage } from "@langchain/core/messages";
// import { createReactAgent } from "@langchain/langgraph/prebuilt";
// import chalk from "chalk";
// import { blockchainInstance } from "../constants";
// import { allTools, allToolSchema } from "../tools/registry";
// import { ToolSchema } from "../types";
// import { MongoClient } from "mongodb";
// import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";

// async function initializeAgent(threadId: string, toolNumbers: number[]) {
//   // 1. Configure tools
//   const tools = Object.values(allTools).filter((_, idx) =>
//     toolNumbers.includes(idx)
//   );

//   // 2. Configure the metadata of all the tools
//   function toolMetadatafetcher() {
//     return Object.values(allToolSchema).map((item: ToolSchema, idx: number) => {
//       if (toolNumbers.includes(idx))
//         return `
//   - Tool Name: ${item.name}
//   - Tool Description: ${item.description}
//   - Requires Approval: ${item?.requiresApproval || false}
//   \n
//   `;
//     });
//   }

//   let model;

//   // 3. Configure the model provider
//   if (process.env.ANTHROPIC_API_KEY!) {
//     model = new ChatAnthropic({
//       apiKey: process.env.ANTHROPIC_API_KEY!,
//       model: "claude-3-haiku-20240307",
//     });
//     console.log(chalk.red("Model Initilaized"));
//   } else {
//     model = new ChatGoogleGenerativeAI({
//       apiKey: process.env.GEMINI_API_KEY!,
//     });
//   }

//   // 4. Construct the system message
//   const systemMessage = new SystemMessage(`
// Your name is EarnKit (Agent).
// You are a specialized AI assistant for Base blockchain, designed to provide secure, accurate, and user-friendly assistance.
// You are assigned to user's wallet. So, your wallet address and the user's wallet address are the same

// - Behavioral Guidelines:
//   1. NEVER be rude to user
//   2. NEVER try to be over professional
//   3. ALWAYS be friendly to the user
//   4. NEVER act over politely
//   4. ALWAYS be concise and to the point

// Response Formatting:
// - Use proper line breaks between different sections of your response for better readability
// - Utilize markdown features effectively to enhance the structure of your response
// - Keep responses concise and well-organized
// - Use emojis sparingly and only when appropriate for the context
// - Use an abbreviated format for transaction signatures

// Common knowledge:
// - Your are hyperoptimized for base blockchain
// - Wallet address of user: ${blockchainInstance.account.address}
// - Chain currently Operating on: ${blockchainInstance.chain.name}

// Realtime knowledge:
// - { approximateCurrentTime: ${new Date().toISOString()}}

// Your Available Tools:
// ${toolMetadatafetcher()}

// IMPORTANT POINTS:
// - You are in your developement phase
// - The development team will update you with more features
// - Don't use tools when it is not necessary
// - **Always try to provide short, clear and concise responses**
// `);

//   // 5. Initiate mongo client
//   const client = new MongoClient(process.env.MONGO_URI!);
//   const agentCheckpointer = new MongoDBSaver({ client });

//   const config = {
//     configurable: {
//       thread_id: threadId,
//     },
//   };

//   let agent;

//   const read = await agentCheckpointer.get(config);
//   if (!read) {
//     agent = createReactAgent({
//       llm: model,
//       tools,
//       checkpointSaver: agentCheckpointer,
//     });
//   } else {
//     agent = createReactAgent({
//       llm: model,
//       tools,
//       checkpointSaver: agentCheckpointer,
//     });
//   }

//   // const agentCheckpointer = new MemorySaver();

//   return { agent, systemMessage };
// }

// export async function messageAgent(msg: string, threadId: string) {
//   const { agent, systemMessage } = await initializeAgent(threadId, [0, 1, 2]);

//   return await agent.invoke(
//     {
//       messages: [systemMessage, { role: "user", content: msg.toString() }],
//     },
//     { configurable: { thread_id: threadId } }
//   );
// }
