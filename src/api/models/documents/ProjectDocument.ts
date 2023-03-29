import mongoose from "mongoose";
import { ProjectStatus } from "../enum/ProjectStatus";
import { IColumn } from "../interfaces/IColumn";

export interface ProjectDocument {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  // maybe enum idk
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  teamId: mongoose.Types.ObjectId;
  columns: IColumn[];
}
