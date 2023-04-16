import mongoose from "mongoose";

export interface ColumnDocument {
  id: string;
  name: string;
  tasks: mongoose.Types.ObjectId[];
}
