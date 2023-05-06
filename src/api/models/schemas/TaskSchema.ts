import { Schema, model, UpdateQuery } from "mongoose";
import { TaskDocument } from "../documents/TaskDocument";
import { labelSchema } from "./LabelSchema";

let taskSchema = new Schema<TaskDocument>(
  {
    title: {
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
    // will be updated
    picture: {
      type: String,
      required: false,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: "Column",
      required: true,
    },
    labels: [
      {
        type: labelSchema,
        required: false,
      },
    ],
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  { timestamps: true }
);

taskSchema.pre(
  "findOneAndUpdate",
  function (this: UpdateQuery<TaskDocument>): void {
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
const Task = model<TaskDocument>("task", taskSchema);

export { taskSchema, Task };
