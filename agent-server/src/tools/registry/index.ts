import { Agent } from "../../agent";
import { Tools } from "../../types";
import { exportBlockchainTools } from "../blockchain";

const allRegistry: ((agent: Agent) => Promise<{
  tools: any[];
  schema: Tools;
}>)[] = [exportBlockchainTools];

/**
 *
 * @param agent
 * @param toolNumbers
 * @returns filtered set of tools
 */
export const exportToolsAndSetMetadata = (
  agent: Agent,
  toolNumbers: number[]
) => {
  let toolMetadata: string[] = [];

  const filteredToolBunches = allRegistry
    .filter((_, idx: number) => toolNumbers.includes(idx))
    .map(
      async (
        item: (agent: Agent) => Promise<{
          tools: any[];
          schema: Tools;
        }>
      ) => {
        const toolItem = await item(agent);
        await agent.tools.push(...toolItem.tools);
        console.log("agent tools", agent.tools);

        Object.values(toolItem.schema).forEach((item) => {
          toolMetadata.push(`
  - Tool Name: ${item.name}
  - Tool Description: ${item.description}
  - Requires Approval: ${item?.requiresApproval || false}
            `);
        });

        return item;
      }
    );

  agent.toolMetadata = toolMetadata.join("\n\n");

  return filteredToolBunches;
};
