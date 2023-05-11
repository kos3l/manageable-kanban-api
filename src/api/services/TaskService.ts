import mongoose from "mongoose";
import { ICreateLabelDTO } from "../models/dtos/label/ICreateLabelDTO";
import { ICreateTaskDTO } from "../models/dtos/task/ICreateTaskDTO";
import { IGetTasksByColumnDTO } from "../models/dtos/task/IGetTasksByColumnDTO";
import { IUpdateTaskDTO } from "../models/dtos/task/IUpdateTaskDTO";
import { ICreateTaskModel } from "../models/dtos/task/model/ICreateTaskModel";
import { Task } from "../models/schemas/TaskSchema";
import labelValidation from "../validations/LabelValidation";
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

const getTaskWithBiggestEndDate = async (projectId: string) => {
  const oneTask = await Task.findOne({ projectId: projectId }, null, {
    sort: { endDate: -1 },
  });
  return oneTask;
};

const createOneTask = async (
  taskDto: ICreateTaskDTO,
  projectId: string,
  projectStartDate: Date,
  projectEndDate: Date
) => {
  const newTask: ICreateTaskModel = {
    ...taskDto,
    projectId: projectId,
  };

  const { error } = taskValidation.createTaskValidation(
    newTask,
    projectStartDate,
    projectEndDate
  );
  if (error) {
    throw new Error(error.details[0].message);
  }

  const allTasks = await Task.create(newTask);
  return allTasks;
};

const updateOneTask = async (
  taskId: string,
  taskDto: IUpdateTaskDTO,
  projectStartDate: Date,
  projectEndDate: Date
) => {
  const { error } = taskValidation.updateTaskValidation(
    taskDto,
    projectStartDate,
    projectEndDate
  );
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
  session: mongoose.mongo.ClientSession | null
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
  session: mongoose.mongo.ClientSession | null
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
  session: mongoose.mongo.ClientSession | null
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
  const { error } = labelValidation.createLabelValidation(labelDto);
  if (error) {
    throw new Error(error.details[0].message);
  }

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

const deleteManyTasks = async (taskIds: mongoose.Types.ObjectId[]) => {
  const deleted = await Task.deleteMany({ _id: { $in: taskIds } });
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
  getTaskWithBiggestEndDate,
  deleteOneTask,
  deleteManyTasks,
};

export default taskService;
