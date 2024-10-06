import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// Interface declaration
export interface ICalendarEvents extends Document {
  userId: string;
  title: string;
  date: string;
}

// ------------------------------------------
// Event definition
const calendarEventsSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  { ...DefaultSchemaOptions },
);

// ------------------------------------------
// Schema model exports
export const CalendarEventsModel: Model<ICalendarEvents> = model<ICalendarEvents>(
  "CalendarEvents",
  calendarEventsSchema,
  "CalendarEvents",
);

export type CalendarEvents_t = {
  userId: string;
  title: string;
  date: string;
};
