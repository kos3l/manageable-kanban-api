import mongoose from "mongoose";
import { TaskDocument } from "../models/documents/TaskDocument";
import { ICreateLabelDTO } from "../models/dtos/label/ICreateLabelDTO";
import { ICreateTaskDTO } from "../models/dtos/task/ICreateTaskDTO";
import { IUpdateTaskDTO } from "../models/dtos/task/IUpdateTaskDTO";
import { ICreateTaskModel } from "../models/dtos/task/model/ICreateTaskModel";
import { Task } from "../models/schemas/TaskSchema";
import labelValidation from "../validations/LabelValidation";
import taskValidation from "../validations/TaskValidation";

const usersJoin = {
  $lookup: {
    from: "users",
    localField: "userIds",
    foreignField: "_id",
    as: "users",
  },
};

const selectedProperties = {
  $project: {
    title: 1,
    description: 1,
    startDate: 1,
    endDate: 1,
    columnId: 1,
    projectId: 1,
    userIds: 1,
    createdAt: 1,
    labels: 1,
    users: {
      _id: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
    },
    project: {
      _id: 1,
      isDeleted: 1,
      status: 1,
    },
  },
};

const getAllTasksByProjectId = async (projectId: string) => {
  const allTasks = await Task.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
      },
    },
    usersJoin,
    selectedProperties,
  ]);

  return allTasks as (mongoose.Document<unknown, {}, TaskDocument> &
    Omit<
      TaskDocument & {
        _id: mongoose.Types.ObjectId;
      },
      never
    >)[];
};

const getAllTasksByColumn = async (
  projectId: string,
  taskIds: mongoose.Types.ObjectId[]
) => {
  const allTasks = await Task.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
        _id: { $in: taskIds },
      },
    },
    usersJoin,
    { $set: { index: { $indexOfArray: [taskIds, "$_id"] } } },
    { $sort: { index: 1 } },
    selectedProperties,
  ]);

  return allTasks as (mongoose.Document<unknown, {}, TaskDocument> &
    Omit<
      TaskDocument & {
        _id: mongoose.Types.ObjectId;
      },
      never
    >)[];
};

const getAllTasksForUser = async (taskIds: mongoose.Types.ObjectId[]) => {
  const allTasks = await Task.aggregate([
    {
      $match: {
        _id: { $in: taskIds },
      },
    },
    usersJoin,
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project",
      },
    },
    selectedProperties,
  ]);

  const notasksFromDeletedProjects = allTasks.filter(
    (task) => task.project[0].isDeleted == false
  );

  return notasksFromDeletedProjects as (mongoose.Document<
    unknown,
    {},
    TaskDocument
  > &
    Omit<
      TaskDocument & {
        _id: mongoose.Types.ObjectId;
      },
      never
    >)[];
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
  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    usersJoin,
    selectedProperties,
  ]);
  return task[0] as mongoose.Document<unknown, {}, TaskDocument> &
    Omit<
      TaskDocument & {
        _id: mongoose.Types.ObjectId;
      },
      never
    >;
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
  getAllTasksForUser,
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
