import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// Interface declaration
export interface IThesisReport extends Document {
  title: string;
  description: string;
  student: string;
  report_files: string[];
  isFinal: boolean;
  status: string;
  date: Date;
  comments: string[];
}

// ------------------------------------------
// Event definition
const thesesRepSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    student: {
      type: String,
      required: true,
    },
    report_files: {
      type: [String],
      default: "No files available",
    },
    isFinal: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      default: "active",
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    comments: {
      type: [String],
      default: [],
    },
  },
  { ...DefaultSchemaOptions },
);

// ------------------------------------------
// Schema model exports
export const ThesesRepModel: Model<IThesisReport> = model<IThesisReport>(
  "ThesisReport",
  thesesRepSchema,
  "ThesisReport",
);

export type ThesesRep_t = {
  name: string;
  description: string;
  image: string;
};
