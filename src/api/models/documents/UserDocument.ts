import mongoose from "mongoose";

export interface UserDocument {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthdate: Date;
  profilePicture?: string;
  bio?: string;
  teams: mongoose.Types.ObjectId[];
  tasks: mongoose.Types.ObjectId[];
  refreshToken?: string;
}

export interface UserMethods {
  comparePassword(password: string): Promise<string>;
}
