import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import { Team } from "../models/schemas/TeamSchema";
import teamValidation from "../validations/TeamValidation";
import userService from "./UserService";

const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const getAllTeams = async () => {};

const getAllTeamsById = async () => {};

const createNewTeam = async (newTeam: ICreateTeamDTO) => {
  const { error } = teamValidation.createTeamValidation(newTeam);
  if (error) {
    throw new ApiError(httpStatus[400], error.details[0].message);
  }

  const userExists = await userService.getUserById(newTeam.createdBy);
  if (!userExists) {
    throw new ApiError(httpStatus[400], "User does not exist!");
  }

  const createdTeam = await Team.create(newTeam);
  return createdTeam;
};

const updateOneTeam = async () => {};

const deleteOneTeam = async () => {};

const teamService = {
  getAllTeams,
  getAllTeamsById,
  createNewTeam,
  updateOneTeam,
  deleteOneTeam,
};

export default teamService;
