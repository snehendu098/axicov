import { Request, Response } from "express";
import { AgentModel } from "../models/agent.model";
import { generatePrivateKey } from "../helper";

interface RequestBody {
  name: string;
  description: string;
  imageUrl: string;
  instruction: string;
  params: object | null;
  threadId: string;
  toolNumbers: number[];
  createdBy: string;
}

const createAgent = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      imageUrl,
      instruction,
      threadId,
      toolNumbers,
      createdBy,
    }: RequestBody = req.body;

    if (
      !name ||
      !description ||
      !imageUrl ||
      !instruction ||
      !threadId ||
      !toolNumbers ||
      !createdBy
    ) {
      res.status(400).json({
        message:
          "Name, description, imageURL, instruction, params, threadId, toolNumbers, messages and createdBy are required",
      });
    }

    const privateKey = await generatePrivateKey();
    const params = {
        privateKey
    }

    await AgentModel.create({
      name,
      description,
      imageUrl,
      instruction,
      params,
      threadId,
      privateKey,
      toolNumbers,
      messages: [],
      createdBy
    });

    res.status(201).json({
      message: "Agent created successfully",
    });
  } catch (err) {
    console.log("Agent creation error");
    res.status(500).json({
      message: "internal server error",
    });
  }
};

const updateAgent = async (req: Request, res: Response) => {
  try {
    const { params, threadId } = req.body;
    const agentDoc = await AgentModel.findOne({threadId})
    if (!agentDoc) {
        return res.status(500).json({
            message: "Agent not found",
        })
    }

    return res.status(201).json({message: "", data: agentDoc})

  } catch (error) {}
};

export { createAgent, updateAgent };
