import mongoose from "mongoose";
import { IColumn } from "../interfaces/IColumn";

export interface ProjectDocument {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  // maybe enum idk
  status: string;
  startDate: Date;
  endDate: Date;
  teamId: mongoose.Types.ObjectId;
  columns: IColumn[];
}
