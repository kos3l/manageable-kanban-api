import { ICreateUserDTO } from "../models/dtos/user/ICreateUserDTO";
import mongoose from "mongoose";
import { User } from "../models/schemas/UserSchema";

const createNewUser = async (user: ICreateUserDTO) => {
  const newUser = await User.create(user);
  return newUser;
};

const getUserById = async (id: mongoose.Types.ObjectId) => {
  const user = await User.findById(id);
  return user;
};

const getUserByEmail = async (email: string) => {
  const user = await User.findOne({
    email: email,
  });
  return user;
};

const userService = {
  createNewUser,
  getUserById,
  getUserByEmail,
};

export default userService;
