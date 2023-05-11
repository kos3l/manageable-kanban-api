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
import { ICreateProjectDTO } from "../models/dtos/project/ICreateProjectDTO";
import { ProjectStatus } from "../models/enum/ProjectStatus";
import { DateHelper } from "../helpers/DateHelper";

const getAllProjects = async (teamId: string) => {
  const allProjects = await Project.find({ teamId: teamId });

  if (allProjects && allProjects.length > 0) {
    const findOverdueProjects = allProjects.filter((projects) => {
      return (
        DateHelper.isDateAftereDate(new Date(), projects.endDate) &&
        projects.status !== ProjectStatus.COMPLETED
      );
    });

    if (findOverdueProjects && findOverdueProjects.length > 0) {
      const projectIds = findOverdueProjects.map((proj) => proj.id.toString());
      await projectService.updateProjectStatus(
        projectIds,
        ProjectStatus.OVERDUE,
        null
      );
    }
  }
  return allProjects;
};

const getProjectById = async (projectId: string) => {
  const project = await Project.find({ _id: projectId });
  if (project && project.length > 0) {
    const findOverdueProject =
      DateHelper.isDateAftereDate(new Date(), project[0].endDate) &&
      project[0].status !== ProjectStatus.COMPLETED;

    if (findOverdueProject) {
      await projectService.updateProjectStatus(
        project[0].id.toString(),
        ProjectStatus.OVERDUE,
        null
      );
    }
  }

  return project[0];
};

const createNewProject = async (
  projectDto: ICreateProjectDTO,
  newColumns: ColumnDocument[],
  session: mongoose.mongo.ClientSession | null
) => {
  const newProjectDTO: ICreateModelDTO = {
    ...projectDto,
    columns: newColumns,
  };

  const { error } = projectValidation.createProjectValidation(newProjectDTO);
  if (error) {
    throw new Error(error.details[0].message);
  }

  const createdProject = await Project.create([newProjectDTO], {
    session: session,
  });
  return createdProject[0];
};

const updateOneProject = async (
  id: string,
  projectDto: IUpdateProjectDTO,
  session: mongoose.mongo.ClientSession | null,
  newestAllowedDate: Date
) => {
  const { error } = projectValidation.updateProjectValidation(
    projectDto,
    newestAllowedDate
  );
  if (error) {
    throw Error(error.details[0].message);
  }

  if (session) {
    const updatedProject = await Project.updateOne({ _id: id }, projectDto, {
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
  session: mongoose.mongo.ClientSession | null
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

const updateProjectStatus = async (
  projectId: string[],
  status: ProjectStatus,
  session: mongoose.mongo.ClientSession | null
) => {
  const updatedProject = await Project.updateMany(
    {
      _id: { $in: projectId },
    },
    {
      status: status,
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
  session: mongoose.mongo.ClientSession | null
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
  session: mongoose.mongo.ClientSession | null
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
  updateColumn,
  softDeleteOneProject,
  addTaskToProjectColumn,
  removeTaskFromProjectColumn,
  updateColumnTaskOrder,
  updateProjectStatus,
};

export default projectService;
