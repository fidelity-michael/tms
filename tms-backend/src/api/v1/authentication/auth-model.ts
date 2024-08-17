import { Document, Schema, Model, model } from 'mongoose';
import { DefaultSchemaOptions } from '../../../models/shared';

// Interface declaration
export interface IAuth extends Document {};

// ------------------------------------------
// Event definition
const authSchema = new Schema(
  { ...DefaultSchemaOptions }
);


// ------------------------------------------
// Schema model exports
export const AuthModel: Model<IAuth> = model<IAuth>(
  'Authenticate', authSchema, 'Authenticate'
);

export type Auth_t = { }
