import mongoose from "mongoose";
import { IUpdateUserDTO } from "../IUpdateUserDTO";
import { IUpdateUserRefreshToken } from "../IUpdateUserRefreshTokenDTO";

export interface IUpdateUserModel
  extends IUpdateUserDTO,
    IUpdateUserRefreshToken {
  teams?: mongoose.Types.ObjectId[];
}
