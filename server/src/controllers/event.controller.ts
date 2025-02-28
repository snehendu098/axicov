import { Request, Response } from "express";
import { EventModel } from "../models/event.model";
import { AgentModel } from "../models/agent.model";

interface RequestBody {
  type: string;
  body: string;
  agentInstance: string;
}

const message = async (req: Request, res: Response) => {
  try {
    const { type, body, agentInstance }: RequestBody = req.body;
    console.log(req.body);

    // Validate required fields
    if (!type || !body || !agentInstance) {
      res.status(400).json({
        message: "type, body and agentInstance are required",
      });
      return;
    }

    // Create new event
    await EventModel.create({ type, body, agentInstance });

    res.status(201).json({
      message: "Event created successfully",
      success: false,
    });
  } catch (error) {
    console.error("Message sending error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const fetchAllMessages = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const agentDoc = await AgentModel.findById(agentId);

    if (!agentDoc) {
      return res
        .status(401)
        .json({ success: false, message: "Agent not found" });
    }

    const messages = await EventModel.find({
      agentInstance: agentDoc.threadId,
    });
    return res.status(201).json({ success: true, data: messages });
  } catch (err) {}
};

export { message };
