import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// Interface declaration
export interface IThesis extends Document {
  title: string;
  topic: string;
  area: string;
  description: string;
  prerequisites: string;
  group: string;
  professor: string;
  required_files: string[];
  thesis_files: string[];
  status: string;
  date: Date;
}

// ------------------------------------------
// Event definition
const thesisSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "No Description",
    },
    prerequisites: {
      type: String,
      default: " ",
    },
    group: {
      type: String,
      required: true,
    },
    professor: {
      type: String,
      minlength: 1,
      required: true,
    },
    required_files: {
      type: [String],
      default: "No files required",
    },
    thesis_files: {
      type: [String],
      default: "No files available",
    },
    status: {
      type: String,
      default: "active",
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  { ...DefaultSchemaOptions },
);

// ------------------------------------------
// Schema model exports
export const ThesisModel: Model<IThesis> =
  model<IThesis>(
    "Thesis",
    thesisSchema,
    "Thesis",
  );

export type Thesis_t = {
  title: string;
  topic: string;
  area: string;
  description: string;
  prerequisites: string;
  group: string;
  professor: string;
  required_files: string[];
  thesis_files: string[];
  status: string;
  date: Date;
};
