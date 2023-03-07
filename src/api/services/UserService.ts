import { ICreateUserDTO } from "../models/dtos/user/ICreateUserDTO";
import mongoose, { HydratedDocument } from "mongoose";
import { UserDocument, UserMethods } from "../models/documents/UserDocument";
import { UserModel } from "../models/types/UserModel";
const User: HydratedDocument<
  UserDocument,
  UserModel
> = require("../models/schemas/UserSchema.ts");

const createNewUser = async (
  user: ICreateUserDTO
): Promise<HydratedDocument<UserDocument, UserMethods> | null> => {
  const newUser: HydratedDocument<UserDocument, UserMethods> | null =
    await User.create(user);
  return newUser;
};

const getUserById = async (
  id: mongoose.Types.ObjectId
): Promise<HydratedDocument<UserDocument, UserMethods> | null> => {
  const user: HydratedDocument<UserDocument, UserMethods> | null =
    await User.findById(id);
  return user;
};

const getUserByEmail = async (
  email: string
): Promise<HydratedDocument<UserDocument, UserMethods> | null> => {
  const user: HydratedDocument<UserDocument, UserMethods> | null =
    await User.findOne({
      email: email,
    });

  return user;
};

module.exports = {
  createNewUser,
  getUserById,
  getUserByEmail,
};
