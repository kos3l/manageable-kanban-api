import { Response } from "express";
import mongoose from "mongoose";
import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import { IUpdateTeamDTO } from "../models/dtos/team/IUpdateTeamDTO";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import teamService from "../services/TeamService";

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

  try {
    const newTeam = await teamService.createNewTeam(newTeamDTO);
    return res.send(newTeam);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
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

const deleteOneTeam = async (req: ExtendedRequest, res: Response) => {};

const teamController = {
  getAllTeams,
  getTeamById,
  createNewTeam,
  updateOneTeam,
  deleteOneTeam,
};

export default teamController;
