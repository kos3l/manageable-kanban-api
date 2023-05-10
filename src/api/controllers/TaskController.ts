import { Response } from "express";
import { ICreateTaskDTO } from "../models/dtos/task/ICreateTaskDTO";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import projectService from "../services/ProjectService";
import taskService from "../services/TaskService";
import { conn } from "../../server";
import { IGetTasksByColumnDTO } from "../models/dtos/task/IGetTasksByColumnDTO";
import { IUpdateTaskDTO } from "../models/dtos/task/IUpdateTaskDTO";
import { IUpdateTaskOrderDTO } from "../models/dtos/task/IUpdateTaskOrderDTO";
import projectValidation from "../validations/ProjectValidation";
import { IUpdateUserToTask } from "../models/dtos/task/IUpdateUserToTask";
import userService from "../services/UserService";
import { ICreateLabelDTO } from "../models/dtos/label/ICreateLabelDTO";
import { ProjectStatus } from "../models/enum/ProjectStatus";
import { DateHelper } from "../helpers/DateHelper";
import dayjs from "dayjs";

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
// get all overdue tasks from columns id []
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

    const createdTask = await taskService.createOneTask(
      payload,
      projectId,
      oneProject.startDate,
      oneProject.endDate
    );
    const columnToBeUpdated = oneProject.columns.find((col) =>
      col._id.equals(createdTask.columnId)
    );

    let isTasksArrayEmpty = false;

    if (!columnToBeUpdated) {
      await session.abortTransaction();
      return res.status(400).send({ message: "Column doesn't exist!" });
    }

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

    // compares two GMT dates
    // Update projects status to ongoing
    // is today after project start
    if (
      oneProject.status === ProjectStatus.NOTSTARTED &&
      DateHelper.isDateAftereDate(new Date(), oneProject.startDate)
    ) {
      await projectService.updateProjectStatus(
        oneProject.id.toString(),
        ProjectStatus.ONGOING,
        session
      );
    }

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

    const updatedTask = await taskService.updateOneTask(
      taskId,
      data,
      oneProject.startDate,
      oneProject.endDate
    );

    if (!updatedTask) {
      return res.status(404).send({
        message:
          "Cannot update task with id=" + taskId + ". Task was not found",
      });
    } else {
      return res
        .status(200)
        .send({ message: "Task's information was succesfully updated." });
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
      return res.status(404).send({ message: "No column found" });
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
      return res.status(400).send({
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
        .status(200)
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
      await session.abortTransaction();
      return res.status(404).send({
        message:
          "Cannot update task with id=" + taskId + ". Task was not found",
      });
    } else {
      return res
        .status(200)
        .send({ message: "Successfully added user to the task" });
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
        .status(400)
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
          "Cannot update task with id=" + taskId + ". Task was not found",
      });
    } else {
      return res
        .status(200)
        .send({ message: "The user was removed from the task." });
    }
  } catch (err: any) {
    await session.abortTransaction();
    return res.status(500).send({ message: err.message });
  } finally {
    session.endSession();
  }
};

const addLabelToTask = async (req: ExtendedRequest, res: Response) => {
  const taskId = req.params.taskId;
  const userId = req.user!;
  const data: ICreateLabelDTO = req.body;

  try {
    const oneTask = await taskService.getOneTaskById(taskId);
    const oneProject = await projectService.getProjectById(
      oneTask.projectId.toString()
    );
    await projectService.verifyIfUserCanAccessTheProject(
      userId,
      oneProject.teamId.toString()
    );

    let isLabelArrayEmpty = false;
    if (oneTask.labels) {
      isLabelArrayEmpty = oneTask.labels.length == 0;
    }

    const updatedTask = await taskService.addLabelToTask(
      taskId,
      isLabelArrayEmpty,
      data
    );

    if (!updatedTask) {
      return res.status(404).send({
        message:
          "Cannot update task with id=" + taskId + ". Task was not found",
      });
    } else {
      return res
        .status(200)
        .send({ message: "Label was succesfully added to the task." });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

const removeLabelFromTask = async (req: ExtendedRequest, res: Response) => {
  const taskId = req.params.taskId;
  const labelId = req.params.labelId;
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

    const updatedTask = await taskService.removeLabelFromTask(taskId, labelId);

    if (!updatedTask) {
      return res.status(404).send({
        message:
          "Cannot update task with id=" + taskId + ". Task was not found",
      });
    } else {
      return res
        .status(200)
        .send({ message: "Label was successfully removed from the task" });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
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

    await taskService.deleteOneTask(oneTask._id);
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
  removeLabelFromTask,
  addLabelToTask,
};

export default taskController;
