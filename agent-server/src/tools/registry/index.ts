import { Agent } from "../../agent";
import { Tools } from "../../types";
import { exportBlockchainTools } from "../blockchain";
import { exportFarcasterTools } from "../farcaster";
import { AppError } from "../../utils/errorHandler";

const allRegistry: ((agent: Agent) => Promise<{
  tools: any[];
  schema: Tools;
}>)[] = [];

const coreRegistry: ((agent: Agent) => Promise<{
  tools: any[];
  schema: Tools;
}>)[] = [exportBlockchainTools, exportFarcasterTools];

/**
 *
 * @param agent
 * @param toolNumbers
 * @returns filtered set of tools
 */
export const exportToolsAndSetMetadata = async (
  agent: Agent,
  toolNumbers: number[]
) => {
  try {
    let toolMetadata: string[] = [];

    const filteredToolBunches = allRegistry.filter((_, idx: number) =>
      toolNumbers.includes(idx)
    );

    const toolPromises = coreRegistry.concat(filteredToolBunches).map(
      async (
        item: (agent: Agent) => Promise<{
          tools: any[];
          schema: Tools;
        }>
      ) => {
        try {
          const toolItem = await item(agent);
          agent.tools.push(...toolItem.tools);

          Object.values(toolItem.schema).forEach((item) => {
            toolMetadata.push(`
  - Tool Name: ${item.name}
  - Tool Description: ${item.description}
  - Requires Approval: ${item?.requiresApproval || false}
            `);
          });

          return toolItem;
        } catch (error: any) {
          console.error(`Error loading tool:`, error);
          // Don't continue - propagate the error
          throw new AppError(
            `Tool initialization failed: ${error.message}`,
            500
          );
        }
      }
    );

    // Wait for all tools to be loaded or fail gracefully
    const results = await Promise.allSettled(toolPromises);

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Tool at index ${index} failed to load:`, result.reason);
      }
    });

    agent.toolMetadata = toolMetadata.join("\n\n");

    // Check for any failed tools and throw detailed error
    const failedTools = results.filter(
      (result) => result.status === "rejected"
    );
    if (failedTools.length > 0) {
      const failureMessages = failedTools
        .map((result, index) => {
          if (result.status === "rejected") {
            return `Tool ${index}: ${result.reason.message || "Unknown error"}`;
          }
          return null;
        })
        .filter(Boolean)
        .join("; ");

      throw new AppError(
        `Failed to initialize one or more tools: ${failureMessages}`,
        500
      );
    }

    // If no tools were loaded successfully, throw an error
    if (agent.tools.length === 0) {
      throw new AppError("Failed to load any tools", 500);
    }

    return results;
  } catch (error: any) {
    console.error("Error in exportToolsAndSetMetadata:", error);
    throw new AppError(`Failed to export tools: ${error.message}`, 500);
  }
};
