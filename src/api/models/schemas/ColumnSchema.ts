import { Schema } from "mongoose";
import { ColumnDocument } from "../documents/ColumnDocument";
import { taskSchema } from "./TaskSchema";

export let columnSchema = new Schema<ColumnDocument>({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  tasks: [
    {
      type: taskSchema,
      required: true,
    },
  ],
  order: {
    type: Number,
    required: true,
  },
});
