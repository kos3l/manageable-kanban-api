import mongoose from "mongoose";
import { ICreateProjectDTO } from "../models/dtos/project/ICreateProjectDTO";
import { IUpdateProjectDTO } from "../models/dtos/project/IUpdateProjectDTO";
import { Project } from "../models/schemas/ProjectSchema";
import projectValidation from "../validations/ProjectValidation";
import teamService from "./TeamService";

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

const updateOneProject = async (
  id: string,
  projectDto: IUpdateProjectDTO,
  session?: mongoose.mongo.ClientSession
) => {
  if (session) {
    const updatedProject = await Project.findByIdAndUpdate(id, [projectDto], {
      session,
    });
    return updatedProject;
  } else {
    const updatedProject = await Project.findByIdAndUpdate(id, projectDto);
    return updatedProject;
  }
};

const verifyIfUserCanAccessTheProject = async (
  userId: string | undefined,
  teamId: string
) => {
  if (!userId) {
    throw new Error("Unauthorised");
  }
  const isUserInTheTeam = await teamService.getTeamById(userId, teamId);
  if (isUserInTheTeam == null) {
    throw new Error(
      "Can't preview projects of a team the user does not belong to"
    );
  }
};

const projectService = {
  createNewProject,
  getAllProjects,
  getProjectById,
  updateOneProject,
  verifyIfUserCanAccessTheProject,
};

export default projectService;
