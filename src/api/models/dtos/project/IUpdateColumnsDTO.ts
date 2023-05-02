import mongoose from "mongoose";

export interface IUpdateColumnDTO {
  id: string;
  name: string;
  tasks: mongoose.Types.ObjectId[];
  order: number;
}
