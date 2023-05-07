import mongoose from "mongoose";
import { ICreateLabelDTO } from "../models/dtos/label/ICreateLabelDTO";
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

const getAllTasksForAUserByProject = async (
  projectIds: string[],
  userIds: string[]
) => {
  const allTasks = await Task.find({
    projectId: { $in: projectIds },
    userIds: { $elemMatch: { $in: userIds } },
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

const updateTaskByAddingUser = async (
  taskId: string,
  userId: string,
  isEmpty: boolean,
  session?: mongoose.mongo.ClientSession
) => {
  const mutation = isEmpty
    ? {
        $push: { userIds: userId },
      }
    : {
        $addToSet: {
          userIds: userId,
        },
      };

  const updatedTask = await Task.updateOne(
    {
      _id: taskId,
    },
    mutation,
    { session }
  );

  return updatedTask;
};

const updateTaskByRemovingUser = async (
  taskId: string,
  userId: string,
  session?: mongoose.mongo.ClientSession
) => {
  const updatedTask = await Task.updateOne(
    {
      _id: taskId,
    },
    { $pull: { userIds: userId } },
    { session }
  );

  return updatedTask;
};

const removeUsersByProjectIds = async (
  projectIds: string[],
  userIds: string[],
  session?: mongoose.mongo.ClientSession
) => {
  const updatedTask = await Task.updateMany(
    {
      projectId: { $in: projectIds },
    },
    { $pull: { userIds: { $in: userIds } } },
    { session: session, multi: true }
  );

  return updatedTask;
};

const addLabelToTask = async (
  taskId: string,
  isEmpty: boolean,
  labelDto: ICreateLabelDTO
) => {
  const mutation = isEmpty
    ? {
        $push: { labels: labelDto },
      }
    : {
        $addToSet: {
          labels: labelDto,
        },
      };

  const updatedTask = await Task.updateOne(
    {
      _id: taskId,
    },
    mutation
  );
  return updatedTask;
};

const removeLabelFromTask = async (taskId: string, labelId: string) => {
  const updatedTask = await Task.updateOne(
    {
      _id: taskId,
    },
    {
      $pull: {
        labels: { _id: labelId },
      },
    }
  );
  return updatedTask;
};

const deleteOneTask = async (taskId: mongoose.Types.ObjectId) => {
  const deleted = await Task.deleteOne({ _id: taskId });
  return deleted;
};

const taskService = {
  getAllTasksByProjectId,
  createOneTask,
  getAllTasksByColumn,
  getOneTaskById,
  updateOneTask,
  updateTaskByAddingUser,
  updateTaskByRemovingUser,
  getAllTasksForAUserByProject,
  removeUsersByProjectIds,
  addLabelToTask,
  removeLabelFromTask,
  deleteOneTask,
};

export default taskService;
