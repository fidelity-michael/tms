import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../../models/shared";

// Interface declaration
// NOTE: Capital P for private
export interface IPMessage extends Document {
  user1: string;
  user2: string;
  lastMessage: Object;
  date: Date;
}

// ------------------------------------------
// Event definition
const PmessageSchema = new Schema(
  {
    user1: { type: String, required: true },
    user2: { type: String, required: true },
    lastMessage: { type: Object, default: {} },
    date: { type: Date, default: Date.now() },
  },
  { ...DefaultSchemaOptions },
);

// ------------------------------------------
// Schema model exports
export const PrivateConversation: Model<IPMessage> = model<IPMessage>(
  "PrivateConversation",
  PmessageSchema,
  "PrivateConversation",
);

export type PMessage_t = {
  user1: string;
  user2: string;
  lastMessage: Object;
  date: Date;
};
