import { MongoClient } from "mongodb";
import chalk from "chalk";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage } from "@langchain/core/messages";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { sseManager } from "../utils/eventManager";
import { clearThreadContext, setThreadContext } from "../utils/threadContext";
import { exportToolsAndSetMetadata } from "../tools/registry";

export class Agent {
  public tools: any[];
  public threadId: string;
  toolMetadata: string;
  public model;
  public systemPrompt?: SystemMessage;
  public mongoClient: any;
  public checkPointSaver: any;
  public config;
  public agent: any;
  public params: any;

  constructor({ threadId, params }: { threadId: string; params: any }) {
    this.threadId = threadId;
    this.params = params;
    this.tools = [];
    this.toolMetadata = "";

    if (process.env.ANTHROPIC_API_KEY!) {
      this.model = new ChatAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY!,
        model: "claude-3-haiku-20240307",
      });
      console.log(chalk.red("Model Initilaized"));
    } else {
      this.model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY!,
      });
    }

    this.config = {
      configurable: {
        thread_id: threadId,
      },
    };
  }

  async initialize(toolNumbers: number[]) {
    await setThreadContext(this.threadId);

    await exportToolsAndSetMetadata(this, toolNumbers);

    this.systemPrompt = new SystemMessage(`
      Your name is EarnKit (Agent).
      You are a specialized AI assistant for Base blockchain, designed to provide secure, accurate, and user-friendly assistance.
      You are assigned to user's wallet. So, your wallet address and the user's wallet address are the same
      
      - Behavioral Guidelines:
        1. NEVER be rude to user
        2. NEVER try to be over professional
        3. ALWAYS be friendly to the user
        4. NEVER act over politely
        4. ALWAYS be concise and to the point
      
      Response Formatting:
      - Use proper line breaks between different sections of your response for better readability
      - Utilize markdown features effectively to enhance the structure of your response
      - Keep responses concise and well-organized
      - Use emojis sparingly and only when appropriate for the context
      - Use an abbreviated format for transaction signatures
      
      Common knowledge:
      - Your are hyperoptimized for base blockchain
      - Wallet address of user: ${this.params.publicKey || ""}
      - Chain currently Operating on: Base
      
      Realtime knowledge:
      - { approximateCurrentTime: ${new Date().toISOString()}}
      
      Your Available Tools:
      ${this.toolMetadata}
      
      IMPORTANT POINTS:
      - You are in your developement phase
      - The development team will update you with more features
      - Don't use tools when it is not necessary
      - **Always try to provide short, clear and concise responses**
      `);

    console.log(chalk.green(this.tools));

    this.mongoClient = new MongoClient(process.env.MONGO_URI!);
    this.checkPointSaver = new MongoDBSaver({ client: this.mongoClient });

    this.agent = createReactAgent({
      llm: this.model,
      tools: this.tools,
      checkpointSaver: this.checkPointSaver,
    });
  }

  async messageAgent(msg: string) {
    setThreadContext(this.threadId);

    sseManager.emitToolEvent(this.threadId, {
      tool: "agent",
      status: "processing",
      message: "Processing message",
      timestamp: new Date().toISOString(),
    });

    const read = await this.checkPointSaver.get(this.config);
    let response;
    if (!read) {
      response = await this.agent.invoke(
        {
          messages: [
            this.systemPrompt,
            { role: "user", content: msg.toString() },
          ],
        },
        {
          configurable: {
            thread_id: this.threadId,
          },
        }
      );
    } else {
      response = await this.agent.invoke(
        {
          messages: [{ role: "user", content: msg.toString() }],
        },
        {
          configurable: {
            thread_id: this.threadId,
          },
        }
      );
    }

    sseManager.emitToolEvent(this.threadId, {
      tool: "agent",
      status: "complete",
      message: "Message processed successfully",
      timestamp: new Date().toISOString(),
    });

    clearThreadContext();
    return response.messages[response.messages.length - 1].content;
  }
}
