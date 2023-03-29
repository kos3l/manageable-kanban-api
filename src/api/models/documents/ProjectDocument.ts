import mongoose from "mongoose";
import { ProjectStatus } from "../enum/ProjectStatus";
import { ColumnDocument } from "./ColumnDocument";

export interface ProjectDocument {
  id: string;
  name: string;
  description?: string;
  techStack: string[];
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  teamId: mongoose.Types.ObjectId;
  columns: ColumnDocument[];
}
