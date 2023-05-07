import { Response } from "express";
import { ICreateTaskDTO } from "../models/dtos/task/ICreateTaskDTO";
import { ICreateTaskModel } from "../models/dtos/task/model/ICreateTaskModel";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import projectService from "../services/ProjectService";
import taskService from "../services/TaskService";
import { conn } from "../../server";
import { IGetTasksByColumnDTO } from "../models/dtos/task/IGetTasksByColumnDTO";
import { IUpdateTaskDTO } from "../models/dtos/task/IUpdateTaskDTO";
import { IUpdateTaskOrderDTO } from "../models/dtos/task/IUpdateTaskOrderDTO";
import mongoose from "mongoose";
import projectValidation from "../validations/ProjectValidation";
import { IUpdateUserToTask } from "../models/dtos/task/IUpdateUserToTask";
import userService from "../services/UserService";

const getAllTasksByProjectId = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const userId = req.user!;

  try {
    const oneProject = await projectService.getProjectById(projectId);
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject.teamId.toString()
    );

    const allTasks = await taskService.getAllTasksByProjectId(projectId);
    return res.send(allTasks);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const getAllTasksByColumn = async (req: ExtendedRequest, res: Response) => {
  const payload: IGetTasksByColumnDTO = req.body;
  const userId = req.user!;

  try {
    const oneProject = await projectService.getProjectById(payload.projectId);
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject.teamId.toString()
    );

    const allTasks = await taskService.getAllTasksByColumn(payload);
    return res.send(allTasks);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const getOneTaskById = async (req: ExtendedRequest, res: Response) => {
  const taskId = req.params.taskId;
  const userId = req.user!;

  try {
    const oneTask = await taskService.getOneTaskById(taskId);
    const oneProject = await projectService.getProjectById(
      oneTask.projectId.toString()
    );
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject.teamId.toString()
    );

    return res.send(oneTask);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const createOneTask = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const userId = req.user!;
  const payload: ICreateTaskDTO = req.body;

  const session = await conn.startSession();
  try {
    session.startTransaction();
    const oneProject = await projectService.getProjectById(projectId);
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject.teamId.toString()
    );

    const taskDto: ICreateTaskModel = {
      ...payload,
      projectId: projectId,
    };

    const createdTask = await taskService.createOneTask(taskDto);
    const columnToBeUpdated = oneProject.columns.find((col) => {
      createdTask.columnId == col._id;
    });

    let isTasksArrayEmpty = false;

    if (columnToBeUpdated && columnToBeUpdated.tasks) {
      if (columnToBeUpdated.tasks.length > 0) {
        isTasksArrayEmpty = true;
      }
    }

    await projectService.addTaskToProjectColumn(
      createdTask.projectId.toString(),
      createdTask._id,
      createdTask.columnId.toString(),
      isTasksArrayEmpty,
      session
    );
    await session.commitTransaction();
    return res.send(createdTask);
  } catch (error: any) {
    await session.abortTransaction();
    return res.status(500).send({ message: error.message });
  } finally {
    session.endSession();
  }
};

const updateOneTask = async (req: ExtendedRequest, res: Response) => {
  const taskId = req.params.taskId;
  const userId = req.user!;
  const data: IUpdateTaskDTO = req.body;

  try {
    const oneTask = await taskService.getOneTaskById(taskId);
    const oneProject = await projectService.getProjectById(
      oneTask.projectId.toString()
    );
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject.teamId.toString()
    );

    const updatedProject = await taskService.updateOneTask(taskId, data);

    if (!updatedProject) {
      return res.status(404).send({
        message:
          "Cannot update task with id=" + taskId + ". Task was not found",
      });
    } else {
      return res.status(201).send({ message: "Task was succesfully updated." });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

const updateTasksOrderInColumn = async (
  req: ExtendedRequest,
  res: Response
) => {
  const userId = req.user!;
  let data: IUpdateTaskOrderDTO = req.body;

  try {
    const { error } = projectValidation.updateColumnTaskOrder(data);
    if (error) {
      throw Error(error.details[0].message);
    }
    const oneProject = await projectService.getProjectById(data.projectId);
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject.teamId.toString()
    );
    const columnBeforeUpdate = oneProject.columns.find((col) =>
      col._id.equals(data.columnId)
    );

    if (columnBeforeUpdate == undefined) {
      return res.status(500).send({ message: "No column found" });
    }
    const tasksAsObjectIds = columnBeforeUpdate.tasks.map((task) =>
      task.toString()
    );

    // Make sure that no task was deleted or added
    const set1 = new Set(tasksAsObjectIds);
    const set2 = new Set(data.tasks);

    const taskArrayHasAllElements =
      tasksAsObjectIds.every((item) => set2.has(item)) &&
      data.tasks.every((item) => set1.has(item));

    if (!taskArrayHasAllElements) {
      return res.status(500).send({
        message: "The tasks from request are different from the original ones",
      });
    }

    // make sure there are no duplicates
    data.tasks = [...new Set(data.tasks)];
    const updatedProject = await projectService.updateColumnTaskOrder(data);
    if (!updatedProject) {
      return res.status(404).send({
        message:
          "Cannot update column with id=" +
          data.columnId +
          ". Column was not found",
      });
    } else {
      return res
        .status(201)
        .send({ message: "Column task order was succesfully updated." });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

const addUserToTask = async (req: ExtendedRequest, res: Response) => {
  const taskId = req.params.taskId;
  const userId = req.user!;
  let payload: IUpdateUserToTask = req.body;

  const session = await conn.startSession();
  try {
    session.startTransaction();
    const oneTask = await taskService.getOneTaskById(taskId);
    const oneProject = await projectService.getProjectById(
      oneTask.projectId.toString()
    );

    // check if both logged in user and user to be added belong to the team
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject.teamId.toString()
    );
    await projectService.verifyIfUserCanAccessTheProject(
      payload.userId,
      oneProject.teamId.toString()
    );

    let isUserIdsArrayEmpty = false;
    if (oneTask.userIds) {
      if (oneTask.userIds.length == 0) {
        isUserIdsArrayEmpty = true;
      }
    }

    const updatedTask = await taskService.updateTaskByAddingUser(
      taskId,
      payload.userId,
      isUserIdsArrayEmpty,
      session
    );

    await userService.addTaskToUser(
      payload.userId,
      taskId,
      isUserIdsArrayEmpty,
      session
    );

    await session.commitTransaction();
    if (!updatedTask) {
      return res.status(404).send({
        message:
          "Cannot update column with id=" + taskId + ". Column was not found",
      });
    } else {
      return res
        .status(201)
        .send({ message: "Column task order was succesfully updated." });
    }
  } catch (err: any) {
    await session.abortTransaction();
    return res.status(500).send({ message: err.message });
  } finally {
    session.endSession();
  }
};

const removeUserFromTask = async (req: ExtendedRequest, res: Response) => {
  const taskId = req.params.taskId;
  const userId = req.user!;
  let payload: IUpdateUserToTask = req.body;

  const session = await conn.startSession();
  try {
    session.startTransaction();
    const oneTask = await taskService.getOneTaskById(taskId);
    const oneProject = await projectService.getProjectById(
      oneTask.projectId.toString()
    );

    if (oneTask.userIds?.length == 0) {
      return res
        .status(500)
        .send({ message: "There are no users assigned to this task already" });
    }

    // check if both logged in user and user to be removed belong to the team
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject.teamId.toString()
    );
    await projectService.verifyIfUserCanAccessTheProject(
      payload.userId,
      oneProject.teamId.toString()
    );

    const updatedTask = await taskService.updateTaskByRemovingUser(
      taskId,
      payload.userId,
      session
    );

    await userService.removeTasksFromUser([payload.userId], [taskId], session);

    await session.commitTransaction();
    if (!updatedTask) {
      return res.status(404).send({
        message:
          "Cannot update column with id=" + taskId + ". Column was not found",
      });
    } else {
      return res
        .status(201)
        .send({ message: "Column task order was succesfully updated." });
    }
  } catch (err: any) {
    await session.abortTransaction();
    return res.status(500).send({ message: err.message });
  } finally {
    session.endSession();
  }
};

const deleteOneTask = async (req: ExtendedRequest, res: Response) => {
  const taskId = req.params.taskId;
  const userId = req.user!;

  const session = await conn.startSession();
  try {
    session.startTransaction();
    const oneTask = await taskService.getOneTaskById(taskId);
    const oneProject = await projectService.getProjectById(
      oneTask.projectId.toString()
    );
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject.teamId.toString()
    );

    //remove from user
    if (oneTask.userIds && oneTask.userIds.length > 0) {
      const allUsersOnTask = oneTask.userIds.map((id) => id.toString());
      await userService.removeTasksFromUser(
        allUsersOnTask,
        [oneTask.id.toString()],
        session
      );
    }

    //remove from project's column
    await projectService.removeTaskFromProjectColumn(
      oneProject.id.toString(),
      oneTask.id,
      oneTask.columnId.toString(),
      session
    );

    await taskService.deleteOneTask(oneTask._id, session);
    await session.commitTransaction();
    return res.status(200).send({ message: "Task was succesfully deleted." });
  } catch (err: any) {
    await session.abortTransaction();
    return res.status(500).send({ message: err.message });
  } finally {
    session.endSession();
  }
};

const taskController = {
  getAllTasksByProjectId,
  createOneTask,
  getAllTasksByColumn,
  getOneTaskById,
  updateOneTask,
  updateTasksOrderInColumn,
  deleteOneTask,
  addUserToTask,
  removeUserFromTask,
};

export default taskController;
