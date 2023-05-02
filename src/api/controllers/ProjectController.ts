import { Response } from "express";
import { ICreateProjectDTO } from "../models/dtos/project/ICreateProjectDTO";
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

const projectController = {
  getAllProjects,
  createNewProject,
  getProjectById,
};

export default projectController;
