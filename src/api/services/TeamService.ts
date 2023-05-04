import mongoose from "mongoose";
import { TeamDocument } from "../models/documents/TeamDocument";
import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import { IUpdateTeamDTO } from "../models/dtos/team/IUpdateTeamDTO";
import { Team } from "../models/schemas/TeamSchema";
import teamValidation from "../validations/TeamValidation";
import userService from "./UserService";
const httpStatus = require("http-status");

const getAllTeams = async (userId: string) => {
  const allTeams = await Team.find({ createdBy: userId });
  return allTeams;
};

const getTeamById = async (userId: string, teamId: string) => {
  const team = await Team.findById(teamId);
  if (
    team &&
    !team.createdBy.equals(userId) &&
    !team.users.includes(new mongoose.Types.ObjectId(userId))
  ) {
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
    // fix this to actually work the status code
    throw new Error(error.details[0].message);
  }

  const userExists = await userService.getUserById(
    newTeam.createdBy.toString()
  );
  if (!userExists) {
    throw new Error("User does not exist!");
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
  if (session) {
    const { error } = teamValidation.updateTeamMembersValidation(updatedTeam);
    if (error) {
      throw new Error(error.details[0].message);
    }

    const sanitisedUserIds = [...new Set(updatedTeam.users)];
    updatedTeam.users = sanitisedUserIds;

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

const removeTeamFromUser = async (
  removedUsers: string[],
  updatedTeam: TeamDocument,
  session: mongoose.mongo.ClientSession
) => {
  const isTeamCreatorRemoved = removedUsers.find((userId) =>
    updatedTeam?.createdBy.equals(userId)
  );

  if (isTeamCreatorRemoved) {
    throw Error("Can't remove the team creator!");
  }

  //update to be done thoguth update many
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

const addTeamToUser = async (
  addedUsers: string[],
  teamId: string,
  session: mongoose.mongo.ClientSession
) => {
  //update to be done thoguth update many
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
  removeTeamFromUser,
  addTeamToUser,
};

export default teamService;
