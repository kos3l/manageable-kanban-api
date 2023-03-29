import { Schema, model } from "mongoose";
import { TeamDocument } from "../documents/TeamDocument";

let teamSchema = new Schema<TeamDocument>(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
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
