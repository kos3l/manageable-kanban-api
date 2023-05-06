import { Response } from "express";
import { ICreateTaskDTO } from "../models/dtos/task/ICreateTaskDTO";
import { ICreateTaskModel } from "../models/dtos/task/model/ICreateTaskModel";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import projectService from "../services/ProjectService";
import taskService from "../services/TaskService";
import { conn } from "../../server";

const getAllTasksByProjectId = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const userId = req.user!;

  try {
    const oneProject = await projectService.getProjectById(projectId);
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject[0].teamId.toString()
    );

    const allProjects = await taskService.getAllTasksByProjectId(projectId);
    return res.send(allProjects);
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

    await projectService.addTaskToProjectColumn(
      createdTask.projectId.toString(),
      createdTask._id,
      createdTask.columnId.toString(),
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
};

export default taskController;
