import Joi from "joi";
import { ColumnDocument } from "../models/documents/ColumnDocument";
import { ICreateProjectDTO } from "../models/dtos/project/ICreateProjectDTO";
import { IUpdateProjectDTO } from "../models/dtos/project/IUpdateProjectDTO";

const createProjectValidation = (data: ICreateProjectDTO) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().min(3).max(1056),
    techStack: Joi.array<string>().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    teamId: Joi.string().required(),
    columns: Joi.array<ColumnDocument>().required(),
  });
  return schema.validate(data);
};

const updateProjectValidation = (data: IUpdateProjectDTO) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255),
    description: Joi.string().min(3).max(1056),
    techStack: Joi.array<string>(),
    startDate: Joi.date(),
    endDate: Joi.date(),
  });
  return schema.validate(data);
};

const projectValidation = {
  createProjectValidation,
  updateProjectValidation,
};
export default projectValidation;
