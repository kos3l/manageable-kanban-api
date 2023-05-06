import { IGetTasksByColumnDTO } from "../models/dtos/task/IGetTasksByColumnDTO";
import { IUpdateTaskDTO } from "../models/dtos/task/IUpdateTaskDTO";
import { ICreateTaskModel } from "../models/dtos/task/model/ICreateTaskModel";
import { Task } from "../models/schemas/TaskSchema";
import taskValidation from "../validations/TaskValidation";

const getAllTasksByProjectId = async (projectId: string) => {
  const allTasks = await Task.find({ projectId: projectId });
  return allTasks;
};

const getAllTasksByColumn = async (getTaskDto: IGetTasksByColumnDTO) => {
  const allTasks = await Task.find({
    projectId: getTaskDto.projectId,
    columnId: getTaskDto.columnId,
  });
  return allTasks;
};

const getOneTaskById = async (taskId: string) => {
  const oneTask = await Task.find({
    _id: taskId,
  });
  return oneTask[0];
};

const createOneTask = async (taskDto: ICreateTaskModel) => {
  const { error } = taskValidation.createTaskValidation(taskDto);
  if (error) {
    throw new Error(error.details[0].message);
  }

  const allTasks = await Task.create(taskDto);
  return allTasks;
};

const updateOneTask = async (taskId: string, taskDto: IUpdateTaskDTO) => {
  const { error } = taskValidation.updateTaskValidation(taskDto);
  if (error) {
    throw new Error(error.details[0].message);
  }

  const updatedTask = await Task.findByIdAndUpdate(taskId, taskDto);
  return updatedTask;
};

const taskService = {
  getAllTasksByProjectId,
  createOneTask,
  getAllTasksByColumn,
  getOneTaskById,
  updateOneTask,
};

export default taskService;
