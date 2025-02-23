import express from "express";
import { Agent } from "../agent";
import { sseManager } from "../utils/eventManager";
import chalk from "chalk";

const router = express.Router();
const agents = new Map<string, Agent>();

// Initialize a new agent
router.post("/agent/initialize", async (req, res): Promise<any> => {
  try {
    const { threadId, toolNumbers, params } = req.body;

    // TODO: fetch params from threadId using rest api

    if (!threadId || !toolNumbers || !params) {
      return res.status(400).json({
        error: "threadId and toolNumbers and params are required",
      });
    }

    // Cleanup existing agent if any
    const existingAgent = agents.get(threadId);
    if (existingAgent) {
      agents.delete(threadId);
    }

    const agent = new Agent({ threadId, params });
    // code chodeni
    await agent.initialize(toolNumbers);
    await agents.set(threadId, agent);

    res.json({
      status: "success",
      message: "Agent initialized",
      threadId,
    });
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to initialize agent",
    });
  }
});

// Send message to agent
router.post("/agent/:threadId/message", async (req, res): Promise<any> => {
  try {
    const { threadId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const agent = agents.get(threadId);
    if (!agent) {
      return res.status(404).json({
        error: "Agent not found",
      });
    }

    const response = await agent.messageAgent(message);
    console.log(chalk.green(response));
    return res.json({ response });
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to process message",
    });
  }
});

// Get SSE events for an agent
router.get("/agent/:threadId/events", (req, res): any => {
  const { threadId } = req.params;

  const agent = agents.get(threadId);
  if (!agent) {
    return res.status(404).json({
      error: "Agent not found",
    });
  }

  sseManager.addClient(threadId, res);
});

// Cleanup agent
router.delete("/agent/:threadId", (req, res): any => {
  const { threadId } = req.params;

  const agent = agents.get(threadId);
  if (!agent) {
    return res.status(404).json({
      error: "Agent not found",
    });
  }

  agents.delete(threadId);
  sseManager.removeClient(threadId);

  res.json({
    status: "success",
    message: "Agent cleaned up",
  });
});

export { router as agentRoutes };
