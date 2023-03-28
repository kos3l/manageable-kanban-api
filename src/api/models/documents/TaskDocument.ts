import mongoose from "mongoose";
import { ILabel } from "../interfaces/ILabel";

export interface TaskDocument {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  picture?: string;
  columnId: mongoose.Types.ObjectId;
  labels?: ILabel[];
}
