import { Request, Response } from "express";
import { UserModel } from "../models/user.model";

interface RequestBody {
    username: string;
    walletAddress: string;
}

const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, walletAddress }: RequestBody = req.body;

        // Validate required fields
        if (!username || !walletAddress) {
            res.status(400).json({
                message: "Username and wallet address are required"
            });
            return;
        }

        // Create new user
        await UserModel.create({ username, walletAddress });

        res.status(201).json({
            message: "User created successfully"
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}

export { signup };