import { Schema, model, Document } from "mongoose";
import { Event } from "./event.model";
import { User } from "./user.model";

export interface Agent extends Document {
  name: string;
  description: string;
  imageUrl: string;
  instructions: string;
  threadId: string;//mongoDB -> uuid.toString gen
  messages: Event["_id"][];
  params: object | null; // update
  createdBy: User["_id"];
  privateKey: string;//gen
  toolNumbers: number[]
}

const agentSchema = new Schema<Agent>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    params: {
      type: Object,
      default: null,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    threadId: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    toolNumbers: [{
      type: Number,
      required: true
    }],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AgentModel = model<Agent>("Agent", agentSchema);
