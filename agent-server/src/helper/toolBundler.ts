import { toolType } from "../types";

export const toolSelector = (
  availableTools: toolType[],
  selectedTools: string
) => {
  // Takes in input from user about which tool to select and makes a bundle of those tools
  const selectedToolsFormatted = Array.from(selectedTools.split(",")).map(
    (toolIndex) => Number(toolIndex) - 1
  );

  const selectedToolsBundle = selectedToolsFormatted.map(
    (toolIndex) => availableTools[toolIndex]
  );

  return selectedToolsBundle;
};
