import { Request, Response } from "express";
import { AgentModel } from "../models/agent.model";
import { generatePrivateKey } from "../helper";
import mongoose from "mongoose";

interface RequestBody {
  name: string;
  description: string;
  imageUrl: string;
  instructions: string;
  params: object | null;
  threadId: string;
  toolNumbers: number[];
  createdBy: string;
}

/**
 *
 * This route will initialize an agent:
 *    Find any agent with threadId and send the agent as response
 *    Or create a new agent and then send it as response
 * @param req
 * @param res
 * @returns agent if it is already created or creates a new one and then sends the request to the agent
 */

const initAgent = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      imageUrl,
      instructions,
      threadId,
      toolNumbers,
      createdBy,
      params,
    }: RequestBody = req.body;

    let agent = await AgentModel.findById(threadId);
    let constructedParams;

    if (agent) {
      if (params) {
        agent.params = { ...agent.params, params };
        await agent.save();
      }

      constructedParams = {
        ...agent.params,
        name: agent.name,
        description: agent.description,
        instructions: agent.instructions,
        privateKey: agent.privateKey,
        toolNumbers: agent.toolNumbers,
      };
      // console.log("CPs", constructedParams);
      res.status(201).json({ success: true, data: constructedParams });
      return;
    }

    if (
      !name ||
      !description ||
      !instructions ||
      !threadId ||
      !toolNumbers ||
      !createdBy
    ) {
      res.status(400).json({
        message:
          "Name, description, imageURL, instructions, threadId, toolNumbers, messages and createdBy are required",
      });
    }

    const privateKey = await generatePrivateKey();

    constructedParams = {
      ...params,
      name,
      description,
      instructions,
      privateKey,
      toolNumbers,
    };

    agent = await AgentModel.create({
      _id: new mongoose.Types.ObjectId(threadId),
      name,
      description,
      imageUrl: imageUrl || "",
      instructions,
      params,
      threadId,
      privateKey,
      toolNumbers,
      messages: [],
      createdBy,
    });

    // console.log("CPs", constructedParams);

    res.status(201).json({
      message: "Agent created successfully",
      success: true,
      data: constructedParams,
    });
  } catch (err) {
    console.log("Agent creation error", err);
    res.status(500).json({
      message: "internal server error",
    });
  }
};

const updateAgent = async (req: Request, res: Response) => {
  try {
    const { params, threadId } = req.body;
    const agentDoc = await AgentModel.findOne({ threadId });

    if (!agentDoc) {
      res.status(500).json({
        message: "Agent not found",
      });
      return;
    }

    agentDoc.params = params;
    await agentDoc.save();

    res.status(201).json({
      message: "Agent updated successully",
      data: agentDoc,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Error occurred", success: false });
  }
};

const getAgentParams = async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    const agentDoc = await AgentModel.findOne({ threadId });

    if (!agentDoc) {
      res.status(404).json({
        message: "Agent not found",
        success: false,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Fetching agent params",
      data: agentDoc.params,
    });
  } catch (err) {
    res.status(401).json({ message: "Error occurred", success: false });
  }
};

const getAgents = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    const agents = await AgentModel.find({ createdBy: address });

    res.status(201).json({ success: true, data: agents });
  } catch (err) {
    res.status(401).json({ message: "Error occurred", success: false });
  }
};

export { initAgent, updateAgent, getAgentParams, getAgents };
