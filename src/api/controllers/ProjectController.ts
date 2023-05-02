import { Response } from "express";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
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

const projectController = {
  getAllProjects,
};

export default projectController;
