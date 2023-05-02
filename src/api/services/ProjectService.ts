import mongoose from "mongoose";
import { ICreateProjectDTO } from "../models/dtos/project/ICreateProjectDTO";
import { Project } from "../models/schemas/ProjectSchema";
import projectValidation from "../validations/ProjectValidation";
const httpStatus = require("http-status");

const getAllProjects = async (teamId: string) => {
  const allProjects = await Project.find({ teamId: teamId });
  return allProjects;
};

const getProjectById = async (projectId: string) => {
  const project = await Project.find({ _id: projectId });
  return project;
};

const createNewProject = async (
  projectDto: ICreateProjectDTO,
  session?: mongoose.mongo.ClientSession
) => {
  const { error } = projectValidation.createProjectValidation(projectDto);
  if (error) {
    // fix this to actually work the status code
    throw new Error(error.details[0].message);
  }

  if (session) {
    const createdProject = await Project.create([projectDto], { session });
    return createdProject[0];
  } else {
    const createdProject = await Project.create(projectDto);
    return createdProject;
  }
};

const projectService = {
  createNewProject,
  getAllProjects,
  getProjectById,
};

export default projectService;
