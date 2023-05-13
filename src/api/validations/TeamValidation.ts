import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import Joi from "joi";
import mongoose from "mongoose";
import { IUpdateTeamDTO } from "../models/dtos/team/IUpdateTeamDTO";
import { IUpdateTeamUsersDTO } from "../models/dtos/team/IUpdateTeamUsersDTO";
import { IUpdateTeamProjectsDTO } from "../models/dtos/team/IUpdateTeamProjectsDTO";

const createTeamValidation = (data: ICreateTeamDTO) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().min(3).max(1056),
    createdBy: Joi.object<mongoose.Types.ObjectId>().required(),
    users: Joi.array<mongoose.Types.ObjectId>().min(1).max(20).required(),
  });
  return schema.validate(data);
};

const updateTeamValidation = (data: IUpdateTeamDTO) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255),
    description: Joi.string().min(3).max(1056),
  });
  return schema.validate(data);
};

const updateTeamUsersValidation = (data: IUpdateTeamUsersDTO) => {
  const schema = Joi.object({
    users: Joi.array<string>().min(1).max(20).required(),
  });
  return schema.validate(data);
};

const updateTeamProjectsValidation = (data: IUpdateTeamProjectsDTO) => {
  const schema = Joi.object({
    projects: Joi.array<string>().min(1).max(200),
  });
  return schema.validate(data);
};

const teamValidation = {
  createTeamValidation,
  updateTeamValidation,
  updateTeamUsersValidation,
  updateTeamProjectsValidation,
};
export default teamValidation;
