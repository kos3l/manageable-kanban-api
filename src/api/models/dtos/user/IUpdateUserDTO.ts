import mongoose from "mongoose";

export interface IUpdateUserDTO {
  firstName: string;
  lastName: string;
  birthdate: Date;
  bio?: string;
  teams: mongoose.Types.ObjectId[];
}
