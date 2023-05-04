import { Response } from "express";
import { ColumnDocument } from "../models/documents/ColumnDocument";
import { ICreateColumnDTO } from "../models/dtos/project/ICreateColumnDTO";
import { ICreateProjectDTO } from "../models/dtos/project/ICreateProjectDTO";
import { IUpdateColumnOrderDTO } from "../models/dtos/project/IUpdateColumnOrderDTO";
import { IUpdateProjectDTO } from "../models/dtos/project/IUpdateProjectDTO";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import columnsService from "../services/ColumnService";
import projectService from "../services/ProjectService";
import projectValidation from "../validations/ProjectValidation";

const getAllProjects = async (req: ExtendedRequest, res: Response) => {
  const teamId = req.params.teamId;
  const userId = req.user;

  try {
    await projectService.verifyIfUserCanAccessTheProject(userId, teamId);
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

  try {
    await projectService.verifyIfUserCanAccessTheProject(userId, teamId);
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

  try {
    await projectService.verifyIfUserCanAccessTheProject(userId, teamId);
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

const addNewColumnToProject = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const teamId = req.params.teamId;
  const userId = req.user;
  const newColumnDto: ICreateColumnDTO = req.body;

  try {
    await projectService.verifyIfUserCanAccessTheProject(userId, teamId);
    const oneProject = await projectService.getProjectById(projectId);
    const currentColumnsArray = oneProject[0].columns;
    const biggestOrderNumber = currentColumnsArray
      .sort((col1, col2) => col1.order - col2.order)
      .reverse()[0].order;
    const newColumn = columnsService.createNewColumn(
      newColumnDto.name,
      biggestOrderNumber + 1
    );
    currentColumnsArray.push(newColumn);

    const updatedProject = await projectService.updateProjectColumns(
      projectId,
      currentColumnsArray
    );

    if (!updatedProject) {
      return res.status(404).send({
        message:
          "Cannot update project with id=" +
          projectId +
          ". Project was not found",
      });
    } else {
      return res.status(201).send({ message: "Column was succesfully added." });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

const deleteColumnFromProject = async (req: ExtendedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const teamId = req.params.teamId;
  const userId = req.user;
  const columnId = req.params.columnId;

  try {
    await projectService.verifyIfUserCanAccessTheProject(userId, teamId);
    const oneProject = await projectService.getProjectById(projectId);
    const currentColumnsArray = oneProject[0].columns;
    const newColumnsArray = currentColumnsArray.filter(
      (col) => !col._id.equals(columnId)
    );

    const updatedProject = await projectService.updateProjectColumns(
      projectId,
      newColumnsArray
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
        .send({ message: "Column was succesfully deleted." });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

const changeColumnOrderOnProject = async (
  req: ExtendedRequest,
  res: Response
) => {
  const projectId = req.params.projectId;
  const teamId = req.params.teamId;
  const userId = req.user;
  const updatedColumn: IUpdateColumnOrderDTO = req.body;

  try {
    await projectService.verifyIfUserCanAccessTheProject(userId, teamId);

    const updatedProject = await projectService.updateProjectColumnsOrder(
      projectId,
      updatedColumn
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
        .send({ message: "Column Order was succesfully updated." });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

// const updateProjectColumns = async (req: ExtendedRequest, res: Response) => {
//   const projectId = req.params.projectId;
//   const teamId = req.params.teamId;
//   const userId = req.user;
//   const data: IUpdateProjectDTO = req.body;

//   await projectService.verifyIfUserCanAccessTheProject(userId, teamId);
//   const projectBeforeChanges = await projectService.getProjectById(projectId);

//   const newColumns = data.columns?.filter((col) =>
//     projectBeforeChanges[0].columns.find(
//       (fetchedCols) => !fetchedCols.id.equals(col.id)
//     )
//   );

//   const deletedColumns = projectBeforeChanges[0].columns.filter((col) =>
//     data.columns?.find((fetchedCols) => !col.id.equals(fetchedCols.id))
//   );

//   const colsToUpdateProperties = projectBeforeChanges[0].columns.filter((col) =>
//     data.columns?.find((fetchedCols) => col.id.equals(fetchedCols.id))
//   );

//   try {
//     // const updatedProject = await projectService.updateProjectColumns(
//     //   projectId,
//     //   data
//     // );
//     // if (!updatedProject) {
//     //   return res.status(404).send({
//     //     message:
//     //       "Cannot update project with id=" +
//     //       projectId +
//     //       ". Project was not found",
//     //   });
//     // } else {
//     //   return res
//     //     .status(201)
//     //     .send({ message: "Project was succesfully updated." });
//     // }
//   } catch (err: any) {
//     return res.status(500).send({ message: err.message });
//   }
// };

const projectController = {
  getAllProjects,
  getProjectById,
  createNewProject,
  updateOneProject,
  addNewColumnToProject,
  deleteColumnFromProject,
  changeColumnOrderOnProject,
};

export default projectController;
