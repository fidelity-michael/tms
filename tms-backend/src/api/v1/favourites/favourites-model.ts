import { Document, Schema, Model, model } from "mongoose";
import { DefaultSchemaOptions } from "../../../models/shared";

// Interface declaration
export interface IFavourites extends Document {
  student: string;
  area_id: string;
  area_name: string;
}

// ------------------------------------------
// Event definition
const favouriteSchema = new Schema(
  {
    student: {
      type: String,
      required: true,
    },
    area_id: {
      type: String,
      required: true,
    },
    area_name: {
      type: String,
      required: true,
    },
  },
  { ...DefaultSchemaOptions },
);

// ------------------------------------------
// Schema model exports
export const FavouritesModel: Model<IFavourites> = model<IFavourites>(
  "Favourites",
  favouriteSchema,
  "Favourites",
);

export type Favourites_t = {
  student: string;
  area_id: string;
  area_name: string;
};
