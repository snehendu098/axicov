import { Schema, model, Document } from "mongoose";
import { Agent } from "./agent.model";

export interface Event extends Document {
  type: string;
  body: string;
  agentInstance: Agent["_id"];
}

const eventSchema = new Schema<Event>(
  {
    type: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    agentInstance: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const EventModel = model<Event>("Event", eventSchema);
