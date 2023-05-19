import mongoose from "mongoose";
import { ProjectDocument } from "./ProjectDocument";
import { UserDocument } from "./UserDocument";

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
  projectModels?: ProjectDocument[];
  userModels?: UserDocument[];
}
