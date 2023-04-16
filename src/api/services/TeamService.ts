import { timeStamp } from "console";
import { Timestamp } from "mongodb";
import mongoose from "mongoose";
import { TeamDocument } from "../models/documents/TeamDocument";
import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import { IUpdateTeamDTO } from "../models/dtos/team/IUpdateTeamDTO";
import { Team } from "../models/schemas/TeamSchema";
import teamValidation from "../validations/TeamValidation";
import userService from "./UserService";
import { ApiError } from "../utils/ApiError";

const httpStatus = require("http-status");

const getAllTeams = async (userId: string) => {
  const allTeams = await Team.find({ createdBy: userId });
  return allTeams;
};

const getTeamById = async (userId: string, teamId: string) => {
  const team = await Team.findById(teamId);
  if (team && !team.createdBy.equals(userId)) {
    return null;
  }
  return team;
};

const createNewTeam = async (
  newTeam: ICreateTeamDTO,
  session?: mongoose.mongo.ClientSession
) => {
  const { error } = teamValidation.createTeamValidation(newTeam);
  if (error) {
    throw new ApiError(httpStatus[400], error.details[0].message);
  }

  const userExists = await userService.getUserById(
    newTeam.createdBy.toString()
  );
  if (!userExists) {
    throw new ApiError(httpStatus[400], "User does not exist!");
  }

  if (session) {
    const createdTeam = await Team.create([newTeam], { session });
    return createdTeam[0];
  } else {
    const createdTeam = await Team.create(newTeam);
    return createdTeam;
  }
};

const updateOneTeam = async (
  id: string,
  updatedTeam: IUpdateTeamDTO,
  session?: mongoose.mongo.ClientSession
) => {
  const { error } = teamValidation.updateTeamMembersValidation(updatedTeam);
  if (error) {
    throw new ApiError(httpStatus[400], error.details[0].message);
  }
  const sanitisedUserIds = [...new Set(updatedTeam.users)];
  updatedTeam.users = sanitisedUserIds;

  if (session) {
    const team = await Team.findByIdAndUpdate(id, updatedTeam, { session });
    return team;
  } else {
    const team = await Team.findByIdAndUpdate(id, updatedTeam);
    return team;
  }
};

const softDeleteOneTeam = async (id: string) => {
  const deletedTeam = await Team.findByIdAndUpdate(id, {
    isDeleted: true,
    deletedAt: Date.now(),
  });
  return deletedTeam;
};

const removeMemembersFromATeam = async (
  removedUsers: string[],
  updatedTeam: TeamDocument,
  session: mongoose.mongo.ClientSession
) => {
  const isTeamCreatorRemoved = removedUsers.find((userId) =>
    updatedTeam?.createdBy.equals(userId)
  );

  if (isTeamCreatorRemoved) {
    throw new ApiError(httpStatus[500], "Can't remove the team creator!");
  }

  for (const id of removedUsers) {
    const user = await userService.getUserById(id);
    if (user && user.teams.length > 1) {
      const newUserTeam = user.teams.filter(
        (team) => !team.equals(updatedTeam.id)
      );
      const fetchedUserTeamArray = newUserTeam;
      await userService.updateUser(
        user.id,
        {
          teams: fetchedUserTeamArray,
        },
        session
      );
    }
  }
};

const addMemembersToATeam = async (
  addedUsers: string[],
  teamId: string,
  session: mongoose.mongo.ClientSession
) => {
  for (const id of addedUsers) {
    const user = await userService.getUserById(id);
    if (user && !user.teams.find((team) => team.equals(teamId))) {
      const fetchedUserTeamArray =
        user.teams.length > 0
          ? [...user.teams, new mongoose.Types.ObjectId(teamId)]
          : [new mongoose.Types.ObjectId(teamId)];

      await userService.updateUser(
        user.id,
        {
          teams: fetchedUserTeamArray,
        },
        session
      );
    }
  }
};

const teamService = {
  getAllTeams,
  getTeamById,
  createNewTeam,
  updateOneTeam,
  softDeleteOneTeam,
  removeMemembersFromATeam,
  addMemembersToATeam,
};

export default teamService;
