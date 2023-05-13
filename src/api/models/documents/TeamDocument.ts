import mongoose from "mongoose";

export interface TeamDocument {
  id: string;
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  picture?: string;
  users: mongoose.Types.ObjectId[];
  projects?: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  deletedAt?: Date;
}
