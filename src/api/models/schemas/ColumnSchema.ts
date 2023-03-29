import { Schema } from "mongoose";
import { IColumn } from "../interfaces/IColumn";
import { taskSchema } from "./TaskSchema";

export let columnSchema = new Schema<IColumn>(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 255,
    },
    tasks: [
      {
        type: taskSchema,
        required: true,
      },
    ],
  },
  { timestamps: true }
);
