import { ICreateUserDTO } from "../models/dtos/user/ICreateUserDTO";
import mongoose from "mongoose";
import { User } from "../models/schemas/UserSchema";
import { IUpdateUserModel } from "../models/dtos/user/model/IUpdateUserModel";

const createNewUser = async (user: ICreateUserDTO) => {
  const newUser = await User.create(user);
  return newUser;
};

const getUserById = async (
  id: string,
  session: mongoose.mongo.ClientSession | null
) => {
  const user = await User.findById(id, {}, { session: session });
  return user;
};

const getUserByEmail = async (email: string) => {
  const user = await User.findOne({
    email: email,
  });
  return user;
};

const getUsersByTeamId = async (teamId: string) => {
  const user = await User.find({
    teams: teamId,
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
  session: mongoose.mongo.ClientSession | null
) => {
  const user = await User.findByIdAndUpdate(id, userDto, { session: session });
  return user;
};

const addTeamToUser = async (
  ids: string[],
  teamId: string,
  session: mongoose.mongo.ClientSession | null
) => {
  const user = await User.updateOne(
    { _id: { $in: ids } },
    { $addToSet: { teams: teamId } },
    { session: session }
  );
  return user;
};

const removeTeamsFromUser = async (
  ids: string[],
  teamIds: string[],
  session: mongoose.mongo.ClientSession | null
) => {
  const user = await User.updateMany(
    { _id: { $in: ids } },
    { $pull: { teams: { $in: teamIds } } },
    { session: session, multi: true }
  );
  return user;
};

const addTaskToUser = async (
  id: string,
  taskId: string,
  isEmpty: boolean,
  session: mongoose.mongo.ClientSession | null
) => {
  const mutation = isEmpty
    ? {
        $push: { tasks: taskId },
      }
    : { $addToSet: { tasks: taskId } };

  const user = await User.updateOne({ _id: id }, mutation, {
    session: session,
  });
  return user;
};

const removeTasksFromUser = async (
  ids: string[],
  taskIds: string[],
  session: mongoose.mongo.ClientSession | null
) => {
  const user = await User.updateMany(
    { _id: { $in: ids } },
    { $pull: { tasks: { $in: taskIds } } },
    { session: session, multi: true }
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
  removeTeamsFromUser,
  addTaskToUser,
  removeTasksFromUser,
  getUsersByTeamId,
};

export default userService;
