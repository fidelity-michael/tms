import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// Interface declaration
export interface IUniversity extends Document {
  name: string;
  country: string;
  date: Date;
}

// ------------------------------------------
// Event definition
const uniSchema = new Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    date: { type: Date, default: Date.now() },
  },
  { ...DefaultSchemaOptions },
);

// ------------------------------------------
// Schema model exports
export const UniversityModel: Model<IUniversity> = model<IUniversity>(
  "University",
  uniSchema,
  "University",
);

export type University_t = {
  name: string;
  country: string;
  date?: Date;
};
