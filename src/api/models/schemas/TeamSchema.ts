import { Schema, model, Model } from "mongoose";
import { TeamDocument } from "../documents/TeamDocument";
import { UserDocument, UserMethods } from "../documents/UserDocument";
import { UserModel } from "../types/UserModel";
const bcrypt = require("bcrypt");

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
      min: 6,
      max: 255,
    },
    users: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
      min: 6,
      max: 255,
    },
  },
  { timestamps: true }
);

export const Team = model<TeamDocument>("team", teamSchema);
