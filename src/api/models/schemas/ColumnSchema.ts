import { Schema } from "mongoose";
import { ColumnDocument } from "../documents/ColumnDocument";

export let columnSchema = new Schema<ColumnDocument>({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  tasks: {
    type: [Schema.Types.ObjectId],
    ref: "Task",
    required: true,
    default: [],
  },
  order: {
    type: Number,
    required: true,
  },
});
