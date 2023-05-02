import { Response } from "express";
import { ICreateProjectDTO } from "../models/dtos/project/ICreateProjectDTO";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import columnsService from "../services/ColumnService";
import projectService from "../services/ProjectService";

const getAllProjects = async (req: ExtendedRequest, res: Response) => {
  const teamId = req.params.id;
  try {
    const allProjects = await projectService.getAllProjects(teamId);
    return res.send(allProjects);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const createNewProject = async (req: ExtendedRequest, res: Response) => {
  const newProject = req.body;

  // extract maybe to somewhere global so it's easier to find and edit
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
};

export default projectController;
