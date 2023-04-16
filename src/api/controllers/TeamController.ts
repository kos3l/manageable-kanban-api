import { Response } from "express";
import mongoose from "mongoose";
import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import { IUpdateTeamDTO } from "../models/dtos/team/IUpdateTeamDTO";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import teamService from "../services/TeamService";
import userService from "../services/UserService";
import { conn } from "../../server";
const getAllTeams = async (req: ExtendedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: "Unauthorised" });
  }
  const id = req.user;
  try {
    const allTeams = await teamService.getAllTeams(id);
    return res.send(allTeams);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const getTeamById = async (req: ExtendedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: "Unauthorised" });
  }
  const userId = req.user;
  const teamId = req.params.id;

  try {
    const team = await teamService.getTeamById(userId, teamId);
    return res.send(team);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const createNewTeam = async (req: ExtendedRequest, res: Response) => {
  const data = req.body;
  const newTeam = data[0];

  if (!req.user) {
    return res.status(401).send({ message: "Unauthorised" });
  }
  const userId = req.user;
  const newTeamDTO: ICreateTeamDTO = {
    ...newTeam,
    createdBy: new mongoose.Types.ObjectId(userId),
    users: [new mongoose.Types.ObjectId(userId)],
  };

  const session = await conn.startSession();
  try {
    session.startTransaction();

    const newTeam = await teamService.createNewTeam(newTeamDTO, session);
    const userToBeUpdated = await userService.getUserById(userId, session);

    if (!userToBeUpdated) {
      await session.abortTransaction();
      return res
        .status(500)
        .send({ message: "Can't find the current logged in user!" });
    }

    const updatedUser = {
      firstName: userToBeUpdated.firstName,
      lastName: userToBeUpdated.lastName,
      birthdate: userToBeUpdated.birthdate,
      teams:
        userToBeUpdated.teams.length > 0
          ? [...userToBeUpdated.teams, newTeam._id]
          : [newTeam._id],
    };

    await userService.updateUser(userId, updatedUser);

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

  try {
    const updatedTeam = await teamService.updateOneTeam(id, data);

    if (!updatedTeam) {
      return res.status(404).send({
        message: "Cannot update team with id=" + id + ". Team was not found",
      });
    } else {
      return res.send({ message: "Team was succesfully updated." });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

const updateTeamMembers = async (req: ExtendedRequest, res: Response) => {
  const teamId: string = req.params.id;
  let teamPayload: IUpdateTeamDTO = req.body;

  if (!teamPayload || !teamPayload.users) {
    return res.status(400).send({
      message: "Request is missing memebers information",
    });
  }
  if (teamPayload.users.length === 0) {
    return res.status(400).send({
      message: "A team needs to have atleast one user!",
    });
  }

  const session = await conn.startSession();
  try {
    session.startTransaction();
    const sanitisedUserIds = [...new Set(teamPayload.users)];
    teamPayload.users = sanitisedUserIds;

    const teamUpdateQueryResult = await teamService.updateOneTeam(
      teamId,
      teamPayload,
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

    let removedUsers = membersBeforeUpdate?.filter(
      (user) => !teamPayload.users?.find((userId) => user.equals(userId))
    );

    let addedUsers = teamPayload.users?.filter(
      (userId) => !membersBeforeUpdate?.find((user) => user.equals(userId))
    );

    if (removedUsers && removedUsers.length > 0) {
      const isTeamCreatorRemoved = removedUsers.find((userId) =>
        teamUpdateQueryResult?.createdBy.equals(userId)
      );

      if (isTeamCreatorRemoved) {
        await session.abortTransaction();
        return res
          .status(500)
          .send({ message: "Can't remove the team creator!" });
      }

      removedUsers.forEach(async (id) => {
        const user = await userService.getUserById(id.toString());
        if (user && user.teams.length > 0) {
          const newUserTeam = user.teams.filter((team) => !team.equals(teamId));
          const fetchedUserTeamArray = newUserTeam;
          await userService.updateUser(
            user.id,
            {
              teams: fetchedUserTeamArray,
            },
            session
          );
        }
      });
    }

    if (addedUsers && addedUsers.length > 0) {
      addedUsers.forEach(async (id) => {
        const user = await userService.getUserById(id.toString());
        if (user && !user.teams.find((team) => team.equals(teamId))) {
          const fetchedUserTeamArray =
            user.teams.length > 0
              ? [...user.teams, new mongoose.Types.ObjectId(teamId)]
              : [new mongoose.Types.ObjectId(teamId)];

          await userService.updateUser(
            user.id,
            {
              teams: fetchedUserTeamArray,
            },
            session
          );
        }
      });
    }

    await session.commitTransaction();
    return res.send({ message: "Team was succesfully updated." });
  } catch (err: any) {
    await session.abortTransaction();
    return res.status(500).send({ message: err.message });
  } finally {
    session.endSession();
  }
};

const deleteOneTeam = async (req: ExtendedRequest, res: Response) => {
  const id: string = req.params.id;
  const userId = req.user;

  if (!userId) {
    return res.status(401).send();
  }

  const teamToBeDeleted = await teamService.getTeamById(userId, id);
  if (teamToBeDeleted == null) {
    return res.status(400).send({
      message: "Cannot delete a team created by another user",
    });
  }

  const loggedInUser = await userService.getUserById(userId);
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
      return res.send({ message: "Team was succesfully deleted." });
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
