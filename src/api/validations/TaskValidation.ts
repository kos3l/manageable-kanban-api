import Joi from "joi";
import { ICreateTaskDTO } from "../models/dtos/task/ICreateTaskDTO";
import { IUpdateTaskDTO } from "../models/dtos/task/IUpdateTaskDTO";

const createTaskValidation = (data: ICreateTaskDTO) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(255).required(),
    description: Joi.string().min(3).max(1056),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    columnId: Joi.string().required(),
    projectId: Joi.string().required(),
  });
  return schema.validate(data);
};

const updateTaskValidation = (data: IUpdateTaskDTO) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(255),
    description: Joi.string().min(3).max(1056),
    startDate: Joi.date(),
    endDate: Joi.date(),
  });
  return schema.validate(data);
};

const taskValidation = {
  createTaskValidation,
  updateTaskValidation,
};
export default taskValidation;
