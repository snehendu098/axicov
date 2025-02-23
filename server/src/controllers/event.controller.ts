import { Request, Response } from "express";
import { EventModel } from "../models/event.model";

interface RequestBody {
  type: string;
  body: string;
  agentInstance: string;
}

const message = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, body, agentInstance }: RequestBody = req.body;

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
    });
    
  } catch (error) {
    console.error("Message sending error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
  }
};

export { message };