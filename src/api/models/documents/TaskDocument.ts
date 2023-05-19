import mongoose from "mongoose";
import { LabelDocument } from "./LabelDocument";
import { ProjectDocument } from "./ProjectDocument";
import { UserDocument } from "./UserDocument";

export interface TaskDocument {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  picture?: string;
  columnId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  userIds: mongoose.Types.ObjectId[];
  labels?: LabelDocument[];
  project?: ProjectDocument[];
  users?: UserDocument[];
}
