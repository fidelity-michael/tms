import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// Interface declaration
export interface IThesesReq extends Document {
  thesis: string;
  professor: string;
  student: string;
  required_files: string[];
  status: string;
  date: Date;
}

// ------------------------------------------
// Event definition
const thesesReqSchema = new Schema(
  {
    thesis: {
      type: String,
      required: true,
    },
    professor: {
      type: String,
      required: true,
    },
    student: {
      type: String,
      required: true,
    },
    required_files: {
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
export const ThesesReqModel: Model<IThesesReq> = model<IThesesReq>(
  "ThesesRequests",
  thesesReqSchema,
  "ThesesRequests",
);

export type ThesesReq_t = {
  thesis: string;
  professor: string;
  student: string;
  required_files: string[];
  status: string;
  date: Date;

};
