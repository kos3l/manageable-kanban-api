import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import Joi from "joi";
import mongoose from "mongoose";

const createTeamValidation = (data: ICreateTeamDTO) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    createdBy: Joi.object<mongoose.Types.ObjectId>().required(),
    users: Joi.array<mongoose.Types.ObjectId>().min(1).max(20).required(),
  });
  return schema.validate(data);
};

const teamValidation = {
  createTeamValidation,
};
export default teamValidation;
