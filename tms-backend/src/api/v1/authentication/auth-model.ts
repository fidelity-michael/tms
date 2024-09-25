import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// Interface declaration
export interface IAuth extends Document {
  results?: {
    auth?: string;
    email?: string;
    role?: string;
    group?: string;
    message?: string;
  };
  data?: Array<{
    cnDn: { cn: string; dn: string };
    mail: string;
    eduPersonAffiliation: string;
    businessCategory: string;
  }>;
}

// ------------------------------------------
// Event definition
const authSchema = new Schema(
  {
    results: {
      auth: { type: String },
      email: { type: String },
      role: { type: String },
      group: { type: String },
      message: { type: String },
    },
  },
  { ...DefaultSchemaOptions },
);

// ------------------------------------------
// Schema model exports
export const AuthModel: Model<IAuth> = model<IAuth>(
  "Authenticate",
  authSchema,
  "Authenticate",
);

export type Auth_t = {};
