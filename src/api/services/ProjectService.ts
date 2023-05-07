import mongoose from "mongoose";
import { ColumnDocument } from "../models/documents/ColumnDocument";
import { ICreateModelDTO } from "../models/dtos/project/model/ICreateProjectModel";
import { IUpdateColumnOrderDTO } from "../models/dtos/project/IUpdateColumnOrderDTO";
import { IUpdateColumnDTO } from "../models/dtos/project/IUpdateColumnsDTO";
import { IUpdateProjectDTO } from "../models/dtos/project/IUpdateProjectDTO";
import { Project } from "../models/schemas/ProjectSchema";
import projectValidation from "../validations/ProjectValidation";
import teamService from "./TeamService";
import { IUpdateTaskOrderDTO } from "../models/dtos/task/IUpdateTaskOrderDTO";

const getAllProjects = async (teamId: string) => {
  const allProjects = await Project.find({ teamId: teamId });
  return allProjects;
};

const getProjectById = async (projectId: string) => {
  const project = await Project.find({ _id: projectId });
  return project[0];
};

const createNewProject = async (
  projectDto: ICreateModelDTO,
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
  const { error } = projectValidation.updateProjectValidation(projectDto);
  if (error) {
    throw Error(error.details[0].message);
  }

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

const updateProjectColumns = async (
  projectId: string,
  newColumns: ColumnDocument[]
) => {
  const updatedProject = await Project.findByIdAndUpdate(projectId, {
    columns: newColumns,
  });
  return updatedProject;
};

const updateOneColumnOrder = async (
  projectId: string,
  updatedColumn: IUpdateColumnOrderDTO,
  session: mongoose.mongo.ClientSession
) => {
  const { error } = projectValidation.updateProjectColumnsOrder(updatedColumn);
  if (error) {
    throw Error(error.details[0].message);
  }

  // Update all columns with order number greater or equal to the order value from body and increment by 1
  await Project.updateOne(
    {
      _id: projectId,
    },
    {
      $inc: { "columns.$[elem1].order": 1 },
    },
    {
      multi: true,
      arrayFilters: [{ "elem1.order": { $gte: updatedColumn.order } }],
      session: session,
    }
  );

  // Sort the array of columns on the project
  await Project.updateOne(
    {
      _id: projectId,
    },
    {
      $push: {
        columns: {
          $each: [],
          $sort: { order: 1 },
        },
      },
    },
    { session: session }
  );

  // Update the column from the body payload and change the order value to the new one
  const updatedProject = await Project.updateOne(
    {
      _id: projectId,
      "columns._id": updatedColumn.columnId,
    },
    {
      $set: {
        "columns.$.order": updatedColumn.order,
      },
    },
    { session: session }
  );
  return updatedProject;
};

const updateColumn = async (
  projectId: string,
  updatedColumn: IUpdateColumnDTO
) => {
  const { error } = projectValidation.updateProjectColumn(updatedColumn);
  if (error) {
    throw Error(error.details[0].message);
  }
  const updatedProject = await Project.updateOne(
    {
      _id: projectId,
      "columns._id": updatedColumn.id,
    },
    {
      $set: {
        "columns.$.name": updatedColumn.name,
      },
    }
  );
  return updatedProject;
};

const addTaskToProjectColumn = async (
  projectId: string,
  taskId: mongoose.Types.ObjectId,
  columnId: string,
  isEmpty: boolean,
  session?: mongoose.mongo.ClientSession
) => {
  const mutation = isEmpty
    ? {
        $push: { "columns.$.tasks": taskId },
      }
    : {
        $addToSet: {
          "columns.$.tasks": taskId,
        },
      };

  const updatedProject = await Project.updateOne(
    {
      _id: projectId,
      "columns._id": columnId,
    },
    mutation,
    { session }
  );
  return updatedProject;
};

const removeTaskFromProjectColumn = async (
  projectId: string,
  taskId: mongoose.Types.ObjectId,
  columnId: string,
  session?: mongoose.mongo.ClientSession
) => {
  const updatedProject = await Project.updateOne(
    {
      _id: projectId,
      "columns._id": columnId,
    },
    {
      $pull: { "columns.$.tasks": taskId },
    },
    { session }
  );
  return updatedProject;
};

const updateColumnTaskOrder = async (newTaskDto: IUpdateTaskOrderDTO) => {
  const updatedProject = await Project.updateOne(
    {
      _id: newTaskDto.projectId,
      "columns._id": newTaskDto.columnId,
    },
    {
      $set: {
        "columns.$.tasks": newTaskDto.tasks,
      },
    }
  );
  return updatedProject;
};

const verifyIfUserCanAccessTheProject = async (
  userId: string,
  teamId: string
) => {
  const isUserInTheTeam = await teamService.getTeamById(userId, teamId);
  if (isUserInTheTeam == null) {
    throw new Error(
      "The user needs to be a part of the team to preview it's projects"
    );
  }
};

const softDeleteOneProject = async (id: string) => {
  const deletedProject = await Project.findByIdAndUpdate(id, {
    isDeleted: true,
    deletedAt: Date.now(),
  });
  return deletedProject;
};

const projectService = {
  createNewProject,
  getAllProjects,
  getProjectById,
  updateOneProject,
  updateProjectColumns,
  updateOneColumnOrder,
  verifyIfUserCanAccessTheProject,
  updateColumn,
  softDeleteOneProject,
  addTaskToProjectColumn,
  removeTaskFromProjectColumn,
  updateColumnTaskOrder,
};

export default projectService;
