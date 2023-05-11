import { Response } from "express";
import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import { IUpdateTeamDTO } from "../models/dtos/team/IUpdateTeamDTO";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import teamService from "../services/TeamService";
import userService from "../services/UserService";
import { conn } from "../../server";
import { IUpdateTeamUsersDTO } from "../models/dtos/team/IUpdateTeamUsersDTO";
import { IUpdateTeamModel } from "../models/dtos/team/model/IUpdateTeamModel";
import { IUpdateUserModel } from "../models/dtos/user/model/IUpdateUserModel";
import teamValidation from "../validations/TeamValidation";
import taskService from "../services/TaskService";
import accessController from "./AccessController";

const getAllTeams = async (req: ExtendedRequest, res: Response) => {
  const id = req.user!;
  try {
    const allTeams = await teamService.getAllTeams(id);
    return res.send(allTeams);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const getTeamById = async (req: ExtendedRequest, res: Response) => {
  const userId = req.user!;
  const teamId = req.params.id;

  try {
    const team = await teamService.getTeamById(userId, teamId);
    return res.send(team);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const createNewTeam = async (req: ExtendedRequest, res: Response) => {
  const newTeamDTO: ICreateTeamDTO = req.body;
  const userId = req.user!;

  const session = await conn.startSession();
  try {
    session.startTransaction();

    const newTeam = await teamService.createNewTeam(
      newTeamDTO,
      userId,
      session
    );
    const userToBeUpdated = await userService.getUserById(userId, session);

    if (!userToBeUpdated) {
      await session.abortTransaction();
      return res
        .status(404)
        .send({ message: "Can't find the current logged in user!" });
    }

    userToBeUpdated.teams =
      userToBeUpdated.teams.length > 0
        ? [...userToBeUpdated.teams, newTeam._id]
        : [newTeam._id];

    await userService.updateUser(
      userId,
      {
        teams: userToBeUpdated.teams,
      } as IUpdateUserModel,
      null
    );

    await session.commitTransaction();
    return res.send(newTeam);
  } catch (error: any) {
    await session.abortTransaction();
    return res.status(500).send({ message: error.message });
  } finally {
    session.endSession();
  }
};

const updateOneTeam = async (req: ExtendedRequest, res: Response) => {
  const id: string = req.params.id;
  const data: IUpdateTeamDTO = req.body;
  const userId = req.user!;

  try {
    await accessController.verifyIfUserCanAccessTheTeam(userId, id);
    const { error } = teamValidation.updateTeamValidation(data);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const updatedTeam = await teamService.updateOneTeam(
      id,
      data as IUpdateTeamModel,
      null
    );

    if (!updatedTeam) {
      return res.status(404).send({
        message: "Cannot update team with id=" + id + ". Team was not found",
      });
    } else {
      return res.status(200).send({ message: "Team was succesfully updated." });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

const updateTeamMembers = async (req: ExtendedRequest, res: Response) => {
  const teamId: string = req.params.id;
  const userId = req.user!;
  let teamPayload: IUpdateTeamUsersDTO = req.body;

  const session = await conn.startSession();
  try {
    session.startTransaction();
    await accessController.verifyIfUserCanAccessTheTeam(userId, teamId);
    const { error } = teamValidation.updateTeamUsersValidation(teamPayload);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    const sanitisedUserIds = [...new Set(teamPayload.users)];
    teamPayload.users = sanitisedUserIds;

    const teamUpdateQueryResult = await teamService.updateOneTeam(
      teamId,
      teamPayload as IUpdateTeamModel,
      session
    );
    const membersBeforeUpdate = teamUpdateQueryResult?.users;

    if (!teamUpdateQueryResult) {
      await session.abortTransaction();
      return res.status(404).send({
        message:
          "Cannot update team with id=" + teamId + ". Team was not found",
      });
    }

    // Removing Users Section - Clean up and updating other entities like tasks and users
    let removedUsers = membersBeforeUpdate?.filter(
      (user) => !teamPayload.users?.find((userId) => user.equals(userId))
    );
    if (removedUsers && removedUsers.length > 0) {
      const removed = removedUsers.map((user) => user.toString());
      const isTeamCreatorRemoved = removed.find((userId) =>
        teamUpdateQueryResult?.createdBy.equals(userId)
      );

      if (isTeamCreatorRemoved) {
        return res.status(400).send({
          message: "Can't remove the team creator!",
        });
      }

      await userService.removeTeamsFromUser(
        removed,
        [teamUpdateQueryResult.id],
        session
      );

      const teamsProjects = teamUpdateQueryResult.projects?.map((project) =>
        project.toString()
      );

      if (teamsProjects && removed) {
        const allTasks = await taskService.getAllTasksForAUserByProject(
          teamsProjects,
          removed
        );
        const ids = allTasks.map((task) => task.id.toString());
        await taskService.removeUsersByProjectIds(
          teamsProjects,
          removed,
          session
        );
        await userService.removeTasksFromUser(removed, ids, session);
      }
    }

    // Add users section
    let addedUsers = teamPayload.users?.filter(
      (userId) => !membersBeforeUpdate?.find((user) => user.equals(userId))
    );
    if (addedUsers && addedUsers.length > 0) {
      await userService.addTeamToUser(addedUsers, teamId, session);
    }

    await session.commitTransaction();
    return res.status(200).send({ message: "Team was succesfully updated." });
  } catch (err: any) {
    await session.abortTransaction();
    return res.status(500).send({ message: err.message });
  } finally {
    session.endSession();
  }
};

const deleteOneTeam = async (req: ExtendedRequest, res: Response) => {
  const id: string = req.params.id;
  const userId = req.user!;

  const teamToBeDeleted = await teamService.getTeamById(userId, id);
  if (teamToBeDeleted == null) {
    return res.status(400).send({
      message: "Cannot delete a team created by another user",
    });
  }

  const loggedInUser = await userService.getUserById(userId, null);
  if (
    loggedInUser?.teams.length == 1 &&
    loggedInUser?.teams.find((team) => team.equals(id))
  ) {
    return res.status(400).send({
      message:
        "Cannot delete your only team! A user needs to belong to atleast one",
    });
  }

  try {
    const deletedTeam = await teamService.softDeleteOneTeam(id);
    if (!deletedTeam) {
      return res.status(404).send({
        message: "Cannot delete team with id=" + id + ". Team was not found",
      });
    } else {
      return res.status(200).send({ message: "Team was succesfully deleted." });
    }
  } catch (err: any) {
    return res
      .status(500)
      .send({ message: "Error deleting team with id" + id });
  }
};

const teamController = {
  getAllTeams,
  getTeamById,
  createNewTeam,
  updateOneTeam,
  updateTeamMembers,
  deleteOneTeam,
};

export default teamController;
