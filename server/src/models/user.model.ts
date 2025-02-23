import { Schema, model, Document } from "mongoose";
import { Agent } from "./agent.model";

export interface User extends Document {
  username: string;
  agents: Agent["_id"][];
  pubKey: string;
}

const userSchema = new Schema<User>(
  {
    username: {
      type: String,
      required: true,
    },
    agents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Agent",
      },
    ],
    pubKey: {
      type: String,
      required: true,
    }, 

  },
  {
    timestamps: true,
  }
);

export const UserModel = model<User>("User", userSchema);
