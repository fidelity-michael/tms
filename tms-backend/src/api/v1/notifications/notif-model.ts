import { Document, Schema, Model, model } from 'mongoose';
import { DefaultSchemaOptions } from '../../../models/shared';

// Interface declaration
export interface INotification extends Document {
  title: string,
  message: string,
  receiver: string,
  type: string,
  status: string,
  date: Date
};

// ------------------------------------------
// Event definition
const notificationSchema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    receiver: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, default: "sent" },
    date: { type: Date, default: Date.now() },
  },
  { ...DefaultSchemaOptions }
);


// ------------------------------------------
// Schema model exports
export const NotificationModel: Model<INotification> = model<INotification>(
  'Notification', notificationSchema, 'Notification'
);

export type Notification_t = {
  title: string,
  message: string,
  receiver: string,
  type: string,
  status: string,
  date: Date
}
