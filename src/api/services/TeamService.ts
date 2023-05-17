import mongoose from "mongoose";
import { TeamDocument } from "../models/documents/TeamDocument";
import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import { ICreateTeamModel } from "../models/dtos/team/model/ICreateTeamModel";
import { IUpdateTeamModel } from "../models/dtos/team/model/IUpdateTeamModel";
import { Team } from "../models/schemas/TeamSchema";
import teamValidation from "../validations/TeamValidation";
import userService from "./UserService";

const getAllTeams = async (userId: string) => {
  const allTeams = await Team.find({ createdBy: userId });
  return allTeams;
};

const getTeamById = async (userId: string, teamId: string) => {
  const team = await Team.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(teamId), isDeleted: false },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projects",
        foreignField: "_id",
        as: "projectModels",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "users",
        foreignField: "_id",
        as: "userModels",
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        createdBy: 1,
        createdAt: 1,
        users: 1,
        projects: 1,
        projectModels: {
          _id: 1,
          name: 1,
          status: 1,
        },
        userModels: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
        },
        __v: 1,
      },
    },
  ]);
  if (
    team &&
    !team[0].createdBy.equals(userId) &&
    !team[0].users.includes(new mongoose.Types.ObjectId(userId))
  ) {
    return null;
  }

  return team[0] as mongoose.Document<unknown, {}, TeamDocument> &
    Omit<
      TeamDocument & {
        _id: mongoose.Types.ObjectId;
      },
      never
    >;
};

const createNewTeam = async (
  newTeam: ICreateTeamDTO,
  userId: string,
  session?: mongoose.mongo.ClientSession
) => {
  const newTeamDTO: ICreateTeamModel = {
    ...newTeam,
    createdBy: new mongoose.Types.ObjectId(userId),
    users: [new mongoose.Types.ObjectId(userId)],
  };

  const { error } = teamValidation.createTeamValidation(newTeamDTO);
  if (error) {
    throw new Error(error.details[0].message);
  }

  const userExists = await userService.getUserById(
    newTeamDTO.createdBy.toString(),
    null
  );
  if (!userExists) {
    throw new Error("User does not exist!");
  }

  if (session) {
    const createdTeam = await Team.create([newTeamDTO], { session });
    return createdTeam[0];
  } else {
    const createdTeam = await Team.create(newTeamDTO);
    return createdTeam;
  }
};

const updateOneTeam = async (
  id: string,
  updatedTeam: IUpdateTeamModel,
  session: mongoose.mongo.ClientSession | null
) => {
  const team = await Team.findByIdAndUpdate(id, updatedTeam, {
    session: session,
  });
  return team;
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
