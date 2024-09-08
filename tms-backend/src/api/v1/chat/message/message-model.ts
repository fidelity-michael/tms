import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../../models/shared";

// Interface declaration
export interface IMessage extends Document {
  sender: string;
  chatId: string;
  text: string;
  files: string[];
  read: string[];
  date: Date;
}

// ------------------------------------------
// Event definition
const messageSchema = new Schema(
  {
    sender: { type: String, required: true },
    chatId: { type: String, required: true },
    text: { type: String, required: true },
    files: { type: [String], required: true },
    read: { type: [String], required: true },
    date: { type: Date, required: true },
  },
  { ...DefaultSchemaOptions },
);

// ------------------------------------------
// Schema model exports
export const MessageModel: Model<IMessage> = model<IMessage>(
  "Message",
  messageSchema,
  "Message",
);

export type Message_t = {
  sender: string;
  chatId: string;
  text: string;
  files: string[];
  read: string[];
  date: Date;
};
