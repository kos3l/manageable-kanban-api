import mongoose from "mongoose";

export interface ColumnDocument {
  id: mongoose.Types.ObjectId;
  name: string;
  order: number;
  tasks: mongoose.Types.ObjectId[];
}
