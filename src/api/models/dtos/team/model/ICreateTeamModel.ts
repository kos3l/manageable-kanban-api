import mongoose from "mongoose";
import { ICreateTeamDTO } from "../ICreateTeamDTO";

export interface ICreateTeamModel extends ICreateTeamDTO {
  createdBy: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
}
