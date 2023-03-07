const authService = require("../services/AuthService");
const tokenService = require("../services/TokenService");
import { Response } from "express";
import { HydratedDocument } from "mongoose";
import { UserDocument } from "../models/documents/UserDocument";
import { UserModel } from "../models/types/UserModel";
import { ExtendedRequest } from "../models/util/IExtendedRequest";

const register = async (
  req: ExtendedRequest,
  res: Response
): Promise<Response> => {
  try {
    const savedUser: HydratedDocument<UserDocument, UserModel> =
      await authService.register(req.body);
    return res.json({ error: null, data: savedUser._id });
  } catch (error) {
    return res.status(400).json(error);
  }
};

const login = async (
  req: ExtendedRequest,
  res: Response
): Promise<Response> => {
  try {
    const loggedInUser: HydratedDocument<UserDocument, UserModel> =
      await authService.login(req.body);
    const username: string =
      loggedInUser.firstName + " " + loggedInUser.lastName;

    const token: string = await tokenService.generateToken(
      username,
      loggedInUser._id
    );

    return res.header("auth-token", token).json({
      error: null,
      data: { token },
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports = {
  register,
  login,
};
