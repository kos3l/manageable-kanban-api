import { Schema, model } from "mongoose";
import { TeamDocument } from "../documents/TeamDocument";

let teamSchema = new Schema<TeamDocument>(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 255,
    },
    description: {
      type: String,
      required: false,
      min: 3,
      max: 1056,
    },
    // will be updated
    picture: {
      type: String,
      required: false,
    },
    users: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    projects: {
      type: [Schema.Types.ObjectId],
      ref: "Project",
      required: false,
    },
  },
  { timestamps: true }
);

export const Team = model<TeamDocument>("team", teamSchema);
