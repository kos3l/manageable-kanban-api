import { Response } from "express";
import { ICreateTaskDTO } from "../models/dtos/task/ICreateTaskDTO";
import { ICreateTaskModel } from "../models/dtos/task/model/ICreateTaskModel";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import projectService from "../services/ProjectService";
import taskService from "../services/TaskService";
import { conn } from "../../server";
import { IGetTasksByColumnDTO } from "../models/dtos/task/IGetTasksByColumnDTO";

const getAllTasksByProjectId = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const userId = req.user!;

  try {
    const oneProject = await projectService.getProjectById(projectId);
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject[0].teamId.toString()
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
      oneProject[0].teamId.toString()
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
      oneTask[0].projectId.toString()
    );
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject[0].teamId.toString()
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
      oneProject[0].teamId.toString()
    );

    const taskDto: ICreateTaskModel = {
      ...payload,
      projectId: projectId,
    };

    const createdTask = await taskService.createOneTask(taskDto);
    const columnToBeUpdated = oneProject[0].columns.find((col) => {
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

const taskController = {
  getAllTasksByProjectId,
  createOneTask,
  getAllTasksByColumn,
  getOneTaskById,
};

export default taskController;
