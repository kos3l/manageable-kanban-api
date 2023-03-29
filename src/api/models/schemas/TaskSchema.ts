import { Schema, model } from "mongoose";
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
  },
  { timestamps: true }
);
const Task = model<TaskDocument>("team", taskSchema);

export { taskSchema, Task };
