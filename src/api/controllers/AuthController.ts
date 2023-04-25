import authService from "../services/AuthService";
import tokenService from "../services/TokenService";
import { Response } from "express";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import teamService from "../services/TeamService";
import mongoose from "mongoose";
import { ICreateTeamDTO } from "../models/dtos/team/ICreateTeamDTO";
import { conn } from "../../server";
import userService from "../services/UserService";

const register = async (req: ExtendedRequest, res: Response) => {
  const session = await conn.startSession();
  try {
    session.startTransaction();

    const savedUser = await authService.register(req.body);
    const teamData: ICreateTeamDTO = {
      name: "My first team",
      createdBy: new mongoose.Types.ObjectId(savedUser.id),
      users: [new mongoose.Types.ObjectId(savedUser.id)],
    };

    const firstTeam = await teamService.createNewTeam(teamData, session);

    const updatedUser = {
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      birthdate: savedUser.birthdate,
      teams: [firstTeam._id],
    };

    await userService.updateUser(savedUser.id, updatedUser);

    await session.commitTransaction();
    return res.json({ error: null, data: [savedUser._id, firstTeam._id] });
  } catch (error: any) {
    await session.abortTransaction();
    return res.status(400).send({ message: error.message });
  } finally {
    session.endSession();
  }
};

const login = async (req: ExtendedRequest, res: Response) => {
  try {
    const loggedInUser = await authService.login(req.body);

    const username: string =
      loggedInUser.firstName + " " + loggedInUser.lastName;

    const tokens: string[] = await tokenService.generateToken(
      username,
      loggedInUser.id
    );

    const accessToken = tokens[0];
    const refreshToken = tokens[1];

    userService.updateUser(loggedInUser.id, {
      refreshToken: refreshToken,
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      //issues on local host it needs to be false for postman to work
      secure: true,
      // one day
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    return res.status(400).json(error);
  }
};

const authController = {
  register,
  login,
};

export default authController;
