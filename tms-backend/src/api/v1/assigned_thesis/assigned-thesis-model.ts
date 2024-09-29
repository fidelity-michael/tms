import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// Interface declaration
export interface IAssignedThesis extends Document {
  thesis: string;
  professor: string;
  supervisor: string[];
  student: string;
  title_greek: string;
  title_english: string;
  grade: string;
  status: string;
  date: Date;
}

// ------------------------------------------
// Event definition
const assignedThesisSchema = new Schema(
  {
    thesis: {
      type: String,
      required: true,
    },
    professor: {
      type: String,
      required: true,
    },
    supervisor: {
      type: [String],
      required: true,
    },
    student: {
      type: String,
      required: true,
    },
    title_greek: {
      type: String,
      default: "",
    },
    title_english: {
      type: String,
      default: "",
    },
    grade: {
      type: String,
      default: "",
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
export const AssignedThesisModel: Model<IAssignedThesis> =
  model<IAssignedThesis>(
    "AssignedThesis",
    assignedThesisSchema,
    "AssignedThesis",
  );

export type Area_t = {
  name: string;
  description: string;
  image: string;
};
