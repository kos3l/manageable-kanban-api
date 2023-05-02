import mongoose from "mongoose";

export interface ColumnDocument {
  id: mongoose.Types.ObjectId;
  name: string;
  tasks: mongoose.Types.ObjectId[];
}
