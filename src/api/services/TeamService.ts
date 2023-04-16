import { timeStamp } from "console";
import { Timestamp } from "mongodb";
import mongoose from "mongoose";
import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import { IUpdateTeamDTO } from "../models/dtos/team/IUpdateTeamDTO";
import { Team } from "../models/schemas/TeamSchema";
import teamValidation from "../validations/TeamValidation";
import userService from "./UserService";

const ApiError = require("../utils/ApiError");
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

const teamService = {
  getAllTeams,
  getTeamById,
  createNewTeam,
  updateOneTeam,
  softDeleteOneTeam,
};

export default teamService;
