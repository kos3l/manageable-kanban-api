import mongoose from "mongoose";

export interface IColumn {
  id: string;
  name: string;
  tasks: mongoose.Types.ObjectId[];
}
