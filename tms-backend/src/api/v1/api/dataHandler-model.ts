import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// Interface declaration
export interface DataHandler extends Document { }

// ------------------------------------------
// Event definition
const dataHandlerSchema = new Schema(
  { },
  { ...DefaultSchemaOptions },
);

// ------------------------------------------
// Schema model exports
export const DataHandlerModel: Model<DataHandler> = model<DataHandler>("DataHandler", dataHandlerSchema, "DataHandler");
