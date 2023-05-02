import { Response } from "express";
import { ICreateProjectDTO } from "../models/dtos/project/ICreateProjectDTO";
import { IUpdateProjectDTO } from "../models/dtos/project/IUpdateProjectDTO";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import columnsService from "../services/ColumnService";
import projectService from "../services/ProjectService";
import projectValidation from "../validations/ProjectValidation";

const getAllProjects = async (req: ExtendedRequest, res: Response) => {
  const teamId = req.params.teamId;
  const userId = req.user;

  await projectService.verifyIfUserCanAccessTheProject(userId, teamId);

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

  await projectService.verifyIfUserCanAccessTheProject(userId, teamId);

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
  const userId = req.user;
  const data: IUpdateProjectDTO = req.body;

  await projectService.verifyIfUserCanAccessTheProject(userId, teamId);

  try {
    const { error } = projectValidation.updateProjectValidation(data);
    if (error) {
      return res.status(500).send({ message: error.details[0].message });
    }

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

const updateProjectColumns = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const teamId = req.params.teamId;
  const userId = req.user;
  const data: IUpdateProjectDTO = req.body;

  await projectService.verifyIfUserCanAccessTheProject(userId, teamId);

  try {
    const { error } = projectValidation.updateProjectColumns(data);
    if (error) {
      return res.status(500).send({ message: error.details[0].message });
    }

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
  updateProjectColumns,
};

export default projectController;
