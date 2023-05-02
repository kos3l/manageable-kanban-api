import { Response } from "express";
import { ICreateProjectDTO } from "../models/dtos/project/ICreateProjectDTO";
import { IUpdateProjectDTO } from "../models/dtos/project/IUpdateProjectDTO";
import { IUpdateUserDTO } from "../models/dtos/user/IUpdateUserDTO";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import columnsService from "../services/ColumnService";
import projectService from "../services/ProjectService";
import teamService from "../services/TeamService";

const getAllProjects = async (req: ExtendedRequest, res: Response) => {
  const teamId = req.params.teamId;
  const userId = req.user;
  if (!userId) {
    return res.status(401).send({ message: "Unauthorised" });
  }

  const isUserInTheTeam = await teamService.getTeamById(userId, teamId);
  if (isUserInTheTeam == null) {
    return res.status(401).send({
      message: "Can't preview projects of a team the user does not belong to",
    });
  }

  try {
    const allProjects = await projectService.getAllProjects(teamId);
    return res.send(allProjects);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const getProjectById = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const teamId = req.params.teamId;

  const userId = req.user;
  if (!userId) {
    return res.status(401).send({ message: "Unauthorised" });
  }

  const isUserInTheTeam = await teamService.getTeamById(userId, teamId);
  if (isUserInTheTeam == null) {
    return res.status(401).send({
      message: "Can't preview projects of a team the user does not belong to",
    });
  }

  try {
    const oneProject = await projectService.getProjectById(projectId);
    return res.send(oneProject);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

// MARK: project changes status once the first task is added

const createNewProject = async (req: ExtendedRequest, res: Response) => {
  const newProject = req.body;

  const defaultColumns = ["Backlog", "To Do", "Doing", "Done"];
  const newColumnsArray = columnsService.createNewEmptyColumns(defaultColumns);

  const newProjectDTO: ICreateProjectDTO = {
    ...newProject,
    columns: newColumnsArray,
  };

  try {
    const allProjects = await projectService.createNewProject(newProjectDTO);
    return res.send(allProjects);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const updateOneProject = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const teamId = req.params.teamId;
  const data: IUpdateProjectDTO = req.body;

  const userId = req.user;
  if (!userId) {
    return res.status(401).send({ message: "Unauthorised" });
  }

  const isUserInTheTeam = await teamService.getTeamById(userId, teamId);
  if (isUserInTheTeam == null) {
    return res.status(401).send({
      message: "Can't preview projects of a team the user does not belong to",
    });
  }

  try {
    const updatedProject = await projectService.updateOneProject(
      projectId,
      data
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
        .status(201)
        .send({ message: "Project was succesfully updated." });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

const projectController = {
  getAllProjects,
  getProjectById,
  createNewProject,
  updateOneProject,
};

export default projectController;
