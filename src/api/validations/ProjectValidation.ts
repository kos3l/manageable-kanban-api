import Joi from "joi";
import mongoose from "mongoose";
import { ColumnDocument } from "../models/documents/ColumnDocument";
import { ICreateProjectDTO } from "../models/dtos/project/ICreateProjectDTO";

const createProjectValidation = (data: ICreateProjectDTO) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().min(3).max(1056),
    techStack: Joi.array<string>().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    teamId: Joi.object<mongoose.Types.ObjectId>().required(),
    columns: Joi.array<ColumnDocument>().required(),
  });
  return schema.validate(data);
};

const projectValidation = {
  createProjectValidation,
};
export default projectValidation;
