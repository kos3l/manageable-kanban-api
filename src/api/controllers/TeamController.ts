import { Response } from "express";
import { ExtendedRequest } from "../models/util/IExtendedRequest";

const getAllTeams = async (req: ExtendedRequest, res: Response) => {};

const getAllTeamsById = async (req: ExtendedRequest, res: Response) => {};

const createNewTeam = async (req: ExtendedRequest, res: Response) => {};

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
