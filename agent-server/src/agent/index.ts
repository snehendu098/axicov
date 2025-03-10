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
import axios from "axios";
import { dbEndpoint } from "../constants";
import { AppError } from "../utils/errorHandler";

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
  public runtimeParams: any;

  constructor({ threadId, params }: { threadId: string; params: any }) {
    this.threadId = threadId;
    this.params = params;
    this.tools = [];
    this.toolMetadata = "";
    this.runtimeParams = {};

    try {
      if (process.env.ANTHROPIC_API_KEY) {
        this.model = new ChatAnthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: "claude-3-haiku-20240307",
        });
        console.log(chalk.red("Model Initilaized"));
      } else if (process.env.GEMINI_API_KEY) {
        this.model = new ChatGoogleGenerativeAI({
          apiKey: process.env.GEMINI_API_KEY,
        });
      } else {
        throw new AppError("No valid API key found for AI models", 500);
      }
    } catch (error: any) {
      console.error("Error initializing model:", error);
      throw new AppError(`Failed to initialize model: ${error.message}`, 500);
    }

    this.config = {
      configurable: {
        thread_id: threadId,
      },
    };
  }

  async initialize(toolNumbers: number[]) {
    try {
      await setThreadContext(this.threadId);

      try {
        await exportToolsAndSetMetadata(this, toolNumbers);
      } catch (error: any) {
        // Explicitly handle tool loading errors and stop initialization
        console.error("Failed to load tools:", error);
        clearThreadContext();
        throw new AppError(
          `Agent initialization failed: ${error.message}`,
          500
        );
      }

      this.systemPrompt = new SystemMessage(`
        Your name is ${this.params.name} (Agent).
        
        INSTRUCTIONS:
        ${this.params.instruction}
        
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
        - Your are hyperoptimized for sonic blockchain
        - Your wallet address: ${this.params.publicKey || ""}
        - Chain currently Operating on: Sonic
        
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

      try {
        this.mongoClient = new MongoClient(process.env.MONGO_URI!);
        await this.mongoClient.connect(); // Test connection
        this.checkPointSaver = new MongoDBSaver({ client: this.mongoClient });
      } catch (error: any) {
        console.error("MongoDB connection error:", error);
        throw new AppError(`MongoDB connection failed: ${error.message}`, 500);
      }

      this.agent = createReactAgent({
        llm: this.model,
        tools: this.tools,
        checkpointSaver: this.checkPointSaver,
      });

      console.log(
        chalk.red("ReAct agent initialized with threadId: "),
        this.threadId
      );

      try {
        await axios.post(`${dbEndpoint}/agent/update`, {
          params: this.params,
          threadId: this.threadId,
        });
      } catch (error: any) {
        console.error("Error updating agent parameters:", error);
        // We'll continue even if this fails
      }
    } catch (error: any) {
      console.error("Agent initialization error:", error);
      throw new AppError(`Failed to initialize agent: ${error.message}`, 500);
    }
  }

  async messageAgent(msg: string) {
    try {
      await setThreadContext(this.threadId);

      sseManager.emitToolEvent(this.threadId, {
        message: msg.toString(),
        type: "user",
        timestamp: new Date().toISOString(),
      });

      let response;
      try {
        const read = await this.checkPointSaver.get(this.config);

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
      } catch (error: any) {
        console.error("Error invoking agent:", error);
        throw new AppError(
          `Failed to get agent response: ${error.message}`,
          500
        );
      }

      sseManager.emitToolEvent(this.threadId, {
        type: "agent",
        message: response.messages[response.messages.length - 1].content,
        timestamp: new Date().toISOString(),
      });

      clearThreadContext();
      return response.messages[response.messages.length - 1].content;
    } catch (error: any) {
      clearThreadContext();
      console.error("Message agent error:", error);
      throw new AppError(`Failed to process message: ${error.message}`, 500);
    }
  }
}
