import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import Joi from "joi";
import mongoose from "mongoose";
import { IUpdateTeamDTO } from "../models/dtos/team/IUpdateTeamDTO";

const createTeamValidation = (data: ICreateTeamDTO) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    createdBy: Joi.object<mongoose.Types.ObjectId>().required(),
    users: Joi.array<mongoose.Types.ObjectId>().min(1).max(20).required(),
  });
  return schema.validate(data);
};

const updateTeamMembersValidation = (data: IUpdateTeamDTO) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255),
    users: Joi.array<string>().min(1).max(20).required(),
  });
  return schema.validate(data);
};

const teamValidation = {
  createTeamValidation,
  updateTeamMembersValidation,
};
export default teamValidation;
