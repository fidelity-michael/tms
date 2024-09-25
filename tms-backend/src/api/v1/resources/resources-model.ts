import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// ------------------------------------------
// Interface declaration
export interface IResource extends Document {
  type: string;
  name: string;
  usedFrom?: Date;
  usedTo?: Date;
}
// ------------------------------------------
// Event definition
const resourceSchema = new Schema(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    usedFrom: { type: Date, required: false },
    usedTo: { type: Date, required: false },
  },
  { ...DefaultSchemaOptions },
);

// ------------------------------------------
// Schema model exports
export const ResourceModel: Model<IResource> = model<IResource>(
  "Resource",
  resourceSchema,
  "Resource",
);
