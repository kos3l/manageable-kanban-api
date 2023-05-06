import { ICreateUserDTO } from "../models/dtos/user/ICreateUserDTO";
import mongoose from "mongoose";
import { User } from "../models/schemas/UserSchema";
import { IUpdateUserDTO } from "../models/dtos/user/IUpdateUserDTO";
import { IUpdateUserModel } from "../models/dtos/user/model/IUpdateUserModel";

const createNewUser = async (user: ICreateUserDTO) => {
  const newUser = await User.create(user);
  return newUser;
};

const getUserById = async (
  id: string,
  session?: mongoose.mongo.ClientSession
) => {
  if (session) {
    const user = await User.findById(id, {}, { session });
    return user;
  } else {
    const user = await User.findById(id);
    return user;
  }
};

const getUserByEmail = async (email: string) => {
  const user = await User.findOne({
    email: email,
  });
  return user;
};

const getUserByRefreshToken = async (refreshToken: string) => {
  const user = await User.findOne({
    refreshToken: refreshToken,
  });
  return user;
};

const updateUser = async (
  id: string,
  userDto: IUpdateUserModel,
  session?: mongoose.mongo.ClientSession
) => {
  if (session) {
    const user = await User.findByIdAndUpdate(id, userDto, { session });
    return user;
  } else {
    const user = await User.findByIdAndUpdate(id, userDto);
    return user;
  }
};

const addTeamToUser = async (
  id: string,
  teamId: string,
  session?: mongoose.mongo.ClientSession
) => {
  const user = await User.updateOne(
    { _id: id },
    { $addToSet: { teams: teamId } },
    { session }
  );
  return user;
};

const removeTeamFromUser = async (
  id: string,
  teamId: string,
  session?: mongoose.mongo.ClientSession
) => {
  const user = await User.updateOne(
    { _id: id },
    { $pull: { teams: teamId } },
    { session }
  );
  return user;
};

const userService = {
  createNewUser,
  getUserById,
  getUserByEmail,
  updateUser,
  getUserByRefreshToken,
  addTeamToUser,
  removeTeamFromUser,
};

export default userService;
