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
      return;
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
  const data: IUpdateTeamDTO = req.body;

  if (!data.users) {
    return res.status(400).send({
      message: "Request is missing memebers information",
    });
  }

  try {
    const teamUpdateQueryResult = await teamService.updateOneTeam(teamId, data);
    const membersBeforeUpdate = teamUpdateQueryResult?.users;

    let removedUsers = membersBeforeUpdate?.filter(
      (user) => !data.users?.find((userId) => user.equals(userId))
    );

    let addedUsers = data.users?.filter(
      (userId) => !membersBeforeUpdate?.find((user) => user.equals(userId))
    );

    console.log(removedUsers);
    console.log(addedUsers);

    // compare with the new ids arrray
    // depending on who is there update the users team reference
    // put it all into a transaction
    // forbid from removing the creator of the team
    // forbid from removing team members if it makes the array empty

    // const updateUsers = await data.userIds.forEach(async (id) => {
    //   const user = await userService.getUserById(id);
    //   if (!user) {
    //     return;
    //   }
    //   const fetchedUserTeamArray =
    //     user.teams.length > 0
    //       ? [...user.teams, new mongoose.Types.ObjectId(teamId)]
    //       : [new mongoose.Types.ObjectId(teamId)];

    //   await userService.updateUser(user?.id, {
    //     teams: fetchedUserTeamArray,
    //   });
    // });

    if (!teamUpdateQueryResult) {
      return res.status(404).send({
        message:
          "Cannot update team with id=" + teamId + ". Team was not found",
      });
    } else {
      return res.send({ message: "Team was succesfully updated." });
    }
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

const deleteOneTeam = async (req: ExtendedRequest, res: Response) => {
  const id: string = req.params.id;

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
