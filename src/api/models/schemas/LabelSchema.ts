import { Schema } from "mongoose";
import { LabelDocument } from "../documents/LabelDocument";

export let labelSchema = new Schema<LabelDocument>(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    color: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 24,
    },
  },
  { timestamps: true }
);
