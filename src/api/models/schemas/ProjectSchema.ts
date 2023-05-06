import { Schema, model, UpdateQuery } from "mongoose";
import { ProjectDocument } from "../documents/ProjectDocument";
import { TeamDocument } from "../documents/TeamDocument";
import { ProjectStatus } from "../enum/ProjectStatus";
import { columnSchema } from "./ColumnSchema";

let projectSchema = new Schema<ProjectDocument>(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    description: {
      type: String,
      required: false,
      minlength: 3,
      maxlength: 1056,
    },
    techStack: {
      type: [String],
      required: true,
    },
    status: {
      type: Number,
      required: true,
      enum: ProjectStatus,
      default: ProjectStatus.NOTSTARTED,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    columns: [
      {
        type: columnSchema,
        required: true,
      },
    ],
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

projectSchema.pre(
  "findOneAndUpdate",
  function (this: UpdateQuery<ProjectDocument>): void {
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

projectSchema.pre(
  "updateOne",
  function (this: UpdateQuery<ProjectDocument>): void {
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

projectSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

projectSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});
export const Project = model<ProjectDocument>("project", projectSchema);
