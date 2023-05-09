import Joi from "joi";
import { ICreateTaskDTO } from "../models/dtos/task/ICreateTaskDTO";
import { IUpdateTaskDTO } from "../models/dtos/task/IUpdateTaskDTO";

const createTaskValidation = (
  data: ICreateTaskDTO,
  projectStartDate: Date,
  projectEndDate: Date
) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(255).required(),
    description: Joi.string().min(3).max(1056),
    startDate: Joi.date().required().max(projectEndDate).min(projectStartDate),
    endDate: Joi.date()
      .required()
      .max(projectEndDate)
      .min(projectStartDate)
      .greater(Joi.ref("startDate")),
    columnId: Joi.string().required(),
    projectId: Joi.string().required(),
  });
  return schema.validate(data);
};

const updateTaskValidation = (
  data: IUpdateTaskDTO,
  projectStartDate: Date,
  projectEndDate: Date
) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(255),
    description: Joi.string().min(3).max(1056),
    startDate: Joi.date().max(projectEndDate).min(projectStartDate),
    endDate: Joi.date()
      .max(projectEndDate)
      .min(projectStartDate)
      .greater(Joi.ref("startDate")),
  });
  return schema.validate(data);
};

const taskValidation = {
  createTaskValidation,
  updateTaskValidation,
};
export default taskValidation;
