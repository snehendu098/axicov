import express from "express";
import { Agent } from "../agent";
import { sseManager } from "../utils/eventManager";
import chalk from "chalk";
import axios from "axios";
import { dbEndpoint } from "../constants";
import { asyncHandler, AppError } from "../utils/errorHandler";

const router = express.Router();
const agents = new Map<string, Agent>();

// Initialize a new agent
router.post(
  "/agent/init",
  asyncHandler(async (req: any, res: any): Promise<any> => {
    let { threadId, toolNumbers, params } = req.body;

    if (!threadId || !toolNumbers || !params) {
      throw new AppError(
        "threadId and toolNumbers and params are required",
        400
      );
    }

    try {
      // TODO: Initialize the agent from the server end (Done)
      const { data } = await axios.post(`${dbEndpoint}/agent/init`, {
        threadId,
      });

      if (data.success) {
        params = { ...data.data, ...params };
      }

      // Cleanup existing agent if any
      const existingAgent = agents.get(threadId);
      if (existingAgent) {
        agents.delete(threadId);
      }

      const agent = new Agent({ threadId, params });

      try {
        await agent.initialize(toolNumbers);
        await agents.set(threadId, agent);

        res.json({
          status: "success",
          message: "Agent initialized",
          threadId,
        });
      } catch (error: any) {
        // If agent initialization fails, ensure we don't store a partially initialized agent
        agents.delete(threadId);

        // Throw a clear error about why initialization failed
        throw new AppError(
          `Agent initialization failed: ${error.message}`,
          500
        );
      }
    } catch (error: any) {
      console.log(error);
      throw new AppError(
        error instanceof Error ? error.message : "Failed to initialize agent",
        500
      );
    }
  })
);

// Send message to agent
router.post(
  "/agent/:threadId/message",
  asyncHandler(async (req: any, res: any): Promise<any> => {
    const { threadId } = req.params;
    const { message } = req.body;

    if (!message) {
      throw new AppError("Message is required", 400);
    }

    const agent = agents.get(threadId);
    if (!agent) {
      throw new AppError("Agent not found", 404);
    }

    const response = await agent.messageAgent(message);

    // TODO: Send message to the server to save the message from the user and the agent
    // const { data } = await axios.post(`${dbEndpoint}/agent/events`, {
    //   threadId,
    //   message,
    //   response,
    // });

    console.log(chalk.green(response));
    return res.json({ response });
  })
);

// Get SSE events for an agent
router.get(
  "/agent/:threadId/events",
  asyncHandler((req: any, res: any): any => {
    const { threadId } = req.params;

    const agent = agents.get(threadId);
    if (!agent) {
      throw new AppError("Agent not found", 404);
    }

    sseManager.addClient(threadId, res);
  })
);

// Cleanup agent
router.delete(
  "/agent/:threadId",
  asyncHandler((req: any, res: any): any => {
    const { threadId } = req.params;

    const agent = agents.get(threadId);
    if (!agent) {
      throw new AppError("Agent not found", 404);
    }

    agents.delete(threadId);
    sseManager.removeClient(threadId);

    res.json({
      status: "success",
      message: "Agent cleaned up",
    });
  })
);

// Catch-all route for undefined endpoints
router.all("*", (req, res) => {
  throw new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
});

export { router as agentRoutes };
