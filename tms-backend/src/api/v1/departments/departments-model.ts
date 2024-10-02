import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// Interface declaration
export interface IDepartment extends Document {
  name: string;
  university: string;
  phone: string;
  email: string;
  date: Date;
}

// ------------------------------------------
// Event definition
const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    university: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
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
export const DepartmentModel: Model<IDepartment> = model<IDepartment>(
  "Department",
  departmentSchema,
  "Department",
);

export type Department_t = {
  name: string;
  university: string;
  phone: string;
  email: string;
};
