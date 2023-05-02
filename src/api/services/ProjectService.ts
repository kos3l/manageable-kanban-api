import { Project } from "../models/schemas/ProjectSchema";
const httpStatus = require("http-status");

const getAllProjects = async (teamId: string) => {
  const allProjects = await Project.find({ teamId: teamId });
  return allProjects;
};

const projectService = {
  getAllProjects,
};

export default projectService;
