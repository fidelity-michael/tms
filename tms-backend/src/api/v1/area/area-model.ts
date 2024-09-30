import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// Interface declaration
export interface IArea extends Document {
  name: string;
  description: string;
  image: string;
}

// ------------------------------------------
// Event definition
const areaSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "No Description" },
    image: { type: String, default: "default.jpg" },
  },
  { ...DefaultSchemaOptions },
);

// ------------------------------------------
// Schema model exports
export const AreaModel: Model<IArea> = model<IArea>("Area", areaSchema, "Area");

export type Area_t = {
  name: string;
  description: string;
  image: string;
};
