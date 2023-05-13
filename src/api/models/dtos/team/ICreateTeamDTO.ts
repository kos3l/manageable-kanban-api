import mongoose from "mongoose";

export interface ICreateTeamDTO {
  name: string;
  description?: string;
}
