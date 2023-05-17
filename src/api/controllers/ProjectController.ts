import { Response } from "express";
import { ICreateColumnDTO } from "../models/dtos/project/ICreateColumnDTO";
import { ICreateProjectDTO } from "../models/dtos/project/ICreateProjectDTO";
import { IUpdateColumnOrderDTO } from "../models/dtos/project/IUpdateColumnOrderDTO";
import { IUpdateProjectDTO } from "../models/dtos/project/IUpdateProjectDTO";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import columnsService from "../services/ColumnService";
import projectService from "../services/ProjectService";
import { conn } from "../../server";
import teamService from "../services/TeamService";
import { IUpdateColumnDTO } from "../models/dtos/project/IUpdateColumnsDTO";
import { IUpdateTeamModel } from "../models/dtos/team/model/IUpdateTeamModel";
import projectValidation from "../validations/ProjectValidation";
import taskService from "../services/TaskService";
import { ProjectStatus } from "../models/enum/ProjectStatus";
import { DateHelper } from "../helpers/DateHelper";
import userService from "../services/UserService";
import accessController from "./AccessController";

const getAllProjectsTeamProjects = async (
  req: ExtendedRequest,
  res: Response
) => {
  const teamId = req.params.teamId;
  const userId = req.user!;

  try {
    const isUserInTheTeam = await teamService.getTeamById(userId, teamId);
    if (isUserInTheTeam == null) {
      return res.status(400).send({
        message:
          "The user needs to be a part of the team to preview it's projects",
      });
    }

    const allProjects = await projectService.getAllProjectsTeamProjects(teamId);
    return res.send(allProjects);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const getAllUserProjects = async (req: ExtendedRequest, res: Response) => {
  const userId = req.user!;

  try {
    const allUserTeams = await teamService.getAllTeams(userId);
    const teamsIds = allUserTeams.map((team) => team._id);
    const allProjects = await projectService.getAllUserProjects(teamsIds);
    return res.send(allProjects);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const getProjectById = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const userId = req.user!;

  try {
    const oneProject = await projectService.getProjectById(projectId);

    if (!oneProject) {
      return res.status(500).send({ message: "Project not found!" });
    }

    await accessController.verifyIfUserCanAccessTheTeam(
      userId,
      oneProject.teamId.toString()
    );

    return res.send(oneProject);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const createNewProject = async (req: ExtendedRequest, res: Response) => {
  const newProjectDTO: ICreateProjectDTO = req.body;
  const userId = req.user!;

  const defaultColumns = ["Backlog", "To Do", "Doing", "Done"];
  const newColumnsArray = columnsService.createNewEmptyColumns(defaultColumns);

  const session = await conn.startSession();
  try {
    session.startTransaction();

    const newProject = await projectService.createNewProject(
      newProjectDTO,
      newColumnsArray,
      session
    );
    const teamToBeUpdated = await teamService.getTeamById(
      userId,
      newProjectDTO.teamId
    );

    if (!teamToBeUpdated || !teamToBeUpdated.projects) {
      await session.abortTransaction();
      return res.status(400).send({ message: "Project creation failed." });
    }

    const newProjectsArray: string[] =
      teamToBeUpdated.projects.length > 0
        ? [...teamToBeUpdated.projects, newProject.id]
        : [newProject.id];

    await teamService.updateOneTeam(
      newProjectDTO.teamId,
      {
        projects: newProjectsArray,
      } as IUpdateTeamModel,
      session
    );

    await session.commitTransaction();
    return res.send(newProject);
  } catch (error: any) {
    await session.abortTransaction();
    return res.status(500).send({ message: error.message });
  } finally {
    session.endSession();
  }
};

const updateOneProject = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const userId = req.user!;
  const data: IUpdateProjectDTO = req.body;

  const session = await conn.startSession();
  try {
    session.startTransaction();
    const oneProject = await projectService.getProjectById(projectId);
    if (!oneProject) {
      return res.status(500).send({ message: "Project not found!" });
    }
    await accessController.verifyIfUserCanAccessTheTeam(
      userId,
      oneProject.teamId.toString()
    );
    const biggestEndDatetask = await taskService.getTaskWithBiggestEndDate(
      oneProject._id.toString()
    );

    const newestAllowedDate = biggestEndDatetask
      ? biggestEndDatetask.endDate
      : oneProject.startDate;

    const updatedProject = await projectService.updateOneProject(
      projectId,
      data,
      session,
      newestAllowedDate
    );

    if (!updatedProject) {
      return res.status(404).send({
        message:
          "Cannot update project with id=" +
          projectId +
          ". Project was not found",
      });
    }

    if (
      oneProject.status == ProjectStatus.OVERDUE &&
      data.endDate &&
      DateHelper.isDateAftereDate(new Date(), data.endDate) == false
    ) {
      await projectService.updateProjectStatus(
        [oneProject._id.toString()],
        ProjectStatus.ONGOING,
        session
      );
    }

    await session.commitTransaction();
    return res
      .status(200)
      .send({ message: "Project's information was succesfully updated." });
  } catch (err: any) {
    await session.abortTransaction();
    return res.status(500).send({ message: err.message });
  } finally {
    session.endSession();
  }
};

const addNewColumnToProject = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const userId = req.user!;
  const newColumnDto: ICreateColumnDTO = req.body;

  try {
    const { error } = projectValidation.createNewColumnValidation(newColumnDto);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const oneProject = await projectService.getProjectById(projectId);
    if (!oneProject) {
      return res.status(500).send({ message: "Project not found!" });
    }
    await accessController.verifyIfUserCanAccessTheTeam(
      userId,
      oneProject.teamId.toString()
    );

    const currentColumnsArray = oneProject.columns;
    if (currentColumnsArray.length == 98) {
      return res.status(400).send({ message: "Can't add more columns!" });
    }
    const biggestOrderNumber = currentColumnsArray
      .sort((col1, col2) => col1.order - col2.order)
      .reverse()[0].order;

    const newColumn = columnsService.createNewColumn(
      newColumnDto.name,
      biggestOrderNumber + 1
    );
    currentColumnsArray.push(newColumn);

    const updatedProject = await projectService.updateProjectColumns(
      projectId,
      currentColumnsArray
    );

    if (!updatedProject) {
      return res.status(404).send({
        message:
          "Cannot update project with id=" +
          projectId +
          ". Project was not found",
      });
    } else {
      return res.status(200).send({ message: "Column was succesfully added." });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

const deleteColumnFromProject = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const userId = req.user!;
  const columnId = req.params.columnId;

  const session = await conn.startSession();
  try {
    session.startTransaction();
    const oneProject = await projectService.getProjectById(projectId);
    if (!oneProject) {
      return res.status(500).send({ message: "Project not found!" });
    }
    await accessController.verifyIfUserCanAccessTheTeam(
      userId,
      oneProject.teamId.toString()
    );

    const taskIds = oneProject.columns
      .find((col) => col._id.equals(columnId))
      ?.tasks.map((task) => task._id);

    if (!taskIds) {
      return res.status(500).send({ message: "Unable to map tasks" });
    }

    const tasksOnDeletedColumn = await taskService.getAllTasksByColumn(
      oneProject._id.toString(),
      taskIds
    );

    if (tasksOnDeletedColumn && tasksOnDeletedColumn.length > 0) {
      const taskIds = tasksOnDeletedColumn.map((task) => task._id);
      const userIdsArray = tasksOnDeletedColumn.map((task) => task.userIds);
      const userIds = userIdsArray
        .reduce((acc, val) => {
          if (acc && acc.length > 0) {
            return [...acc, ...val];
          } else {
            return [...val];
          }
        })
        .map((val) => val._id.toString());

      if (userIds && userIds.length > 0) {
        const userIDsNoDuplicates = [...new Set(userIds)];
        await userService.removeTasksFromUser(
          userIDsNoDuplicates,
          taskIds.map((id) => id.toString()),
          session
        );
      }
      await taskService.deleteManyTasks(taskIds);
    }

    let currentColumnsArray = oneProject.columns;
    const deletedCol = currentColumnsArray.find((col) =>
      col._id.equals(columnId)
    );
    if (deletedCol) {
      const itemAfterDeletedCol = currentColumnsArray.find(
        (col) => col.order > deletedCol.order
      );
      if (itemAfterDeletedCol) {
        currentColumnsArray = currentColumnsArray.map((col) => {
          if (col.order >= itemAfterDeletedCol.order) {
            col.order = col.order - 1;
          }
          return col;
        });
      }
    }

    const newColumnsArray = currentColumnsArray.filter(
      (col) => !col._id.equals(columnId)
    );

    const updatedProject = await projectService.updateProjectColumns(
      projectId,
      newColumnsArray
    );

    if (!updatedProject) {
      return res.status(404).send({
        message:
          "Cannot update project with id=" +
          projectId +
          ". Project was not found",
      });
    }

    await session.commitTransaction();
    return res.status(200).send({ message: "Column was succesfully deleted." });
  } catch (err: any) {
    await session.abortTransaction();
    return res.status(500).send({ message: err.message });
  } finally {
    session.endSession();
  }
};

const changeColumnOrderOnProject = async (
  req: ExtendedRequest,
  res: Response
) => {
  const projectId = req.params.projectId;
  const userId = req.user!;
  const updatedColumn: IUpdateColumnOrderDTO = req.body;

  const session = await conn.startSession();
  try {
    session.startTransaction();
    const oneProject = await projectService.getProjectById(projectId);
    if (!oneProject) {
      return res.status(500).send({ message: "Project not found!" });
    }
    await accessController.verifyIfUserCanAccessTheTeam(
      userId,
      oneProject.teamId.toString()
    );

    const columnToBeUpdated = oneProject.columns.find((col) => {
      return col._id.equals(updatedColumn.columnId);
    });

    if (!columnToBeUpdated) {
      await session.abortTransaction();
      return res.status(400).send({ message: "Column doesn't exist!" });
    }

    const updatedProject = await projectService.updateOneColumnOrder(
      projectId,
      updatedColumn,
      columnToBeUpdated.order,
      session
    );

    await session.commitTransaction();
    if (!updatedProject) {
      return res.status(404).send({
        message:
          "Cannot update project with id=" +
          projectId +
          ". Project was not found",
      });
    } else {
      return res
        .status(200)
        .send({ message: "Column Order was succesfully updated." });
    }
  } catch (err: any) {
    await session.abortTransaction();
    return res.status(500).send({ message: err.message });
  } finally {
    session.endSession();
  }
};

const updateColumn = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const userId = req.user!;
  const updatedColumn: IUpdateColumnDTO = req.body;

  try {
    const oneProject = await projectService.getProjectById(projectId);
    if (!oneProject) {
      return res.status(500).send({ message: "Project not found!" });
    }
    await accessController.verifyIfUserCanAccessTheTeam(
      userId,
      oneProject.teamId.toString()
    );
    const updatedProject = await projectService.updateColumn(
      projectId,
      updatedColumn
    );

    if (!updatedProject) {
      return res.status(404).send({
        message:
          "Cannot update project with id=" +
          projectId +
          ". Project was not found",
      });
    } else {
      return res
        .status(200)
        .send({ message: "Column's information was succesfully updated." });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

const completeProject = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const userId = req.user!;

  try {
    const oneProject = await projectService.getProjectById(projectId);
    if (!oneProject) {
      return res.status(500).send({ message: "Project not found!" });
    }
    await accessController.verifyIfUserCanAccessTheTeam(
      userId,
      oneProject.teamId.toString()
    );

    if (oneProject.status == ProjectStatus.NOTSTARTED) {
      return res
        .status(500)
        .send({ message: "Can't complete a not started project" });
    }

    const updatedProject = await projectService.updateProjectStatus(
      [projectId],
      ProjectStatus.COMPLETED,
      null
    );

    if (!updatedProject) {
      return res.status(404).send({
        message:
          "Cannot update project with id=" +
          projectId +
          ". Project was not found",
      });
    } else {
      return res.status(200).send({ message: "Project has been completed!" });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

const deleteOneProject = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const userId = req.user!;

  try {
    const oneProject = await projectService.getProjectById(projectId);
    if (!oneProject) {
      return res.status(500).send({ message: "Project not found!" });
    }
    await accessController.verifyIfUserCanAccessTheTeam(
      userId,
      oneProject.teamId.toString()
    );
    const deletedProject = await projectService.softDeleteOneProject(projectId);
    if (!deletedProject) {
      return res.status(404).send({
        message:
          "Cannot delete project with id=" +
          projectId +
          ". Project was not found",
      });
    } else {
      return res
        .status(200)
        .send({ message: "Project was succesfully deleted." });
    }
  } catch (err: any) {
    return res
      .status(500)
      .send({ message: "Error deleting Project with id" + projectId });
  }
};

const projectController = {
  getAllProjectsTeamProjects,
  getAllUserProjects,
  getProjectById,
  createNewProject,
  updateOneProject,
  addNewColumnToProject,
  deleteColumnFromProject,
  changeColumnOrderOnProject,
  updateColumn,
  deleteOneProject,
  completeProject,
};

export default projectController;
