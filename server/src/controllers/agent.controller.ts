import { Request, Response } from "express";
import { AgentModel } from "../models/agent.model";

interface RequestBody {
    name: string;
    description: string;
    imageUrl: string;
    instruction: string;
}

const createAgent = async( req: Request, res: Response): Promise<void> => {
    try {
        const {name, description, imageUrl, instruction}: RequestBody = req.body;

        if(!name || !description || !imageUrl || !instruction) {
            res.status(400).json({
                message: "Name, description, imageURL, instruction are required"
            })
        }
        
    } catch (err){
        console.log("Agent creation error");
        res.status(500).json({
            message: "internal server error",
        });
    }
}

const updateAgent = async() => {}

export {createAgent, updateAgent}