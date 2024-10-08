import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// Interface declaration
export interface IApi extends Document { }

// ------------------------------------------
// Event definition
const apiSchema = new Schema(
  { },
  { ...DefaultSchemaOptions },
);

// ------------------------------------------
// Schema model exports
export const ApiModel: Model<IApi> = model<IApi>("Api", apiSchema, "Api");
