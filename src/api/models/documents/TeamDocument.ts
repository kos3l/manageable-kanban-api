import mongoose from "mongoose";

export interface TeamDocument {
  id: string;
  name: string;
  description: string;
  picture?: string;
  users: mongoose.Types.ObjectId[];
  projects?: mongoose.Types.ObjectId[];
}
