import { Schema, model, UpdateQuery } from "mongoose";
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
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

teamSchema.pre(
  "findOneAndUpdate",
  function (this: UpdateQuery<TeamDocument>): void {
    const update = this.getUpdate();
    if (!update) {
      return;
    }
    if (update.__v != null) {
      delete update.__v;
    }
    const keys = ["$set", "$setOnInsert"];
    for (const key of keys) {
      if (update[key] != null && update[key].__v != null) {
        delete update[key].__v;
        if (Object.keys(update[key]).length === 0) {
          delete update[key];
        }
      }
    }
    update.$inc = update.$inc || {};
    update.$inc.__v = 1;
  }
);

teamSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

teamSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

export const Team = model<TeamDocument>("team", teamSchema);
