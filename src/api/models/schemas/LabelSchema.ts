import { Schema, model } from "mongoose";
import { IColumn } from "../interfaces/IColumn";
import { ILabel } from "../interfaces/ILabel";

export let labelSchema = new Schema<ILabel>(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 255,
    },
    color: {
      type: String,
      required: true,
      min: 1,
      max: 24,
    },
  },
  { timestamps: true }
);
