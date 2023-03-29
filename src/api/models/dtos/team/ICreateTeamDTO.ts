import mongoose from "mongoose";

export interface ICreateTeamDTO {
  name: string;
  createdBy: mongoose.Types.ObjectId;
  users: [mongoose.Types.ObjectId];
}
