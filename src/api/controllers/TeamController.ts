import { Response } from "express";
import { ObjectId } from "mongodb";
import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import teamService from "../services/TeamService";

const getAllTeams = async (req: ExtendedRequest, res: Response) => {};

const getAllTeamsById = async (req: ExtendedRequest, res: Response) => {};

const createNewTeam = async (req: ExtendedRequest, res: Response) => {
  const data = req.body;
  const newTeam = data[0];

  if (!req.user) {
    return res.status(401).send({ message: "Unauthorised" });
  }
  const userId = req.user;
  const newTeamDTO: ICreateTeamDTO = {
    ...newTeam,
    createdBy: new ObjectId(userId),
    users: [new ObjectId(userId)],
  };

  try {
    const newTeam = await teamService.createNewTeam(newTeamDTO);
    return res.send(newTeam);
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

const updateOneTeam = async (req: ExtendedRequest, res: Response) => {};

const deleteOneTeam = async (req: ExtendedRequest, res: Response) => {};

const teamController = {
  getAllTeams,
  getAllTeamsById,
  createNewTeam,
  updateOneTeam,
  deleteOneTeam,
};

export default teamController;
