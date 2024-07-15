import { Document, Schema, Model, model } from 'mongoose';
import { DefaultSchemaOptions } from '../../../models/shared';

// Interface declaration
export interface IUser extends Document {
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  role: [string],
  group: string,
  status: string,
  department: string,
  date: Date,
};

// ------------------------------------------
// Event definition
const userSchema = new Schema(
  {
    first_name: { type: String, default: "FirstName" },
    last_name: { type: String, default: "LastName" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: [String], required: true },
    group: { type: String, required: true },
    status: { type: String, default: "active" },
    department: { type: String, default: "FirstName" },
    date: { type: Date, default: Date.now() },
  },
  { ...DefaultSchemaOptions }
);

// ------------------------------------------
// Schema model exports
export const UserModel: Model<IUser> = model<IUser>(
  'User', userSchema, 'User'
);

export type User_t = {
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  role: [string],
  group: string,
  status: string,
  department: string,
  date: Date,
}
