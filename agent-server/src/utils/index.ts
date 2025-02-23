import { ToolMessage, ToolMessageChunk } from "@langchain/core/messages";
import { RunnableConfig, RunnableLambda } from "@langchain/core/runnables";
import { Tool, ToolInterface } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";

// TODO: Error handling of tools
