import Joi from "joi";
import mongoose from "mongoose";
import { ColumnDocument } from "../models/documents/ColumnDocument";
import { ICreateColumnDTO } from "../models/dtos/project/ICreateColumnDTO";
import { ICreateProjectDTO } from "../models/dtos/project/ICreateProjectDTO";
import { IUpdateColumnOrderDTO } from "../models/dtos/project/IUpdateColumnOrderDTO";
import { IUpdateColumnDTO } from "../models/dtos/project/IUpdateColumnsDTO";
import { IUpdateProjectDTO } from "../models/dtos/project/IUpdateProjectDTO";
import { IUpdateTaskOrderDTO } from "../models/dtos/task/IUpdateTaskOrderDTO";

const createProjectValidation = (data: ICreateProjectDTO) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().min(3).max(1056),
    techStack: Joi.array<string>().required(),
    startDate: Joi.date().greater("now").iso().required(),
    endDate: Joi.date().greater(Joi.ref("startDate")).iso().required(),
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
    endDate: Joi.date(),
  });
  return schema.validate(data);
};

const createNewColumnValidation = (data: ICreateColumnDTO) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
  });
  return schema.validate(data);
};

const updateProjectColumnsOrder = (data: IUpdateColumnOrderDTO) => {
  const schema = Joi.object({
    columnId: Joi.string().required(),
    order: Joi.number().min(0).max(300).required(),
  });
  return schema.validate(data);
};

const updateProjectColumn = (data: IUpdateColumnDTO) => {
  const schema = Joi.object({
    id: Joi.string().min(2).max(255).required(),
    name: Joi.string().min(2).max(300).required(),
  });
  return schema.validate(data);
};

const updateColumnTaskOrder = (data: IUpdateTaskOrderDTO) => {
  const schema = Joi.object({
    columnId: Joi.string().required(),
    projectId: Joi.string().required(),
    tasks: Joi.array<string>().required(),
  });
  return schema.validate(data);
};

const projectValidation = {
  createProjectValidation,
  updateProjectValidation,
  updateProjectColumnsOrder,
  updateProjectColumn,
  createNewColumnValidation,
  updateColumnTaskOrder,
};
export default projectValidation;
