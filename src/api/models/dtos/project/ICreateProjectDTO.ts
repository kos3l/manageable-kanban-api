import mongoose from "mongoose";
import { ColumnDocument } from "../../documents/ColumnDocument";

export interface ICreateProjectDTO {
  name: string;
  description?: string;
  techStack: string[];
  startDate: Date;
  endDate: Date;
  teamId: mongoose.Types.ObjectId;
  columns: ColumnDocument[];
}
