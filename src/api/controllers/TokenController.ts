import { Response } from "express";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import tokenService from "../services/TokenService";
import userService from "../services/UserService";

const refreshToken = async (req: ExtendedRequest, res: Response) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.sendStatus(401);
  }
  const refreshToken = cookies.jwt;
  const userWithThisRefreshToken = await userService.getUserByRefreshToken(
    refreshToken
  );

  if (!userWithThisRefreshToken) {
    return res.sendStatus(403);
  }

  try {
    const newAccessToken = await tokenService.generateNewAccesToken(
      refreshToken,
      userWithThisRefreshToken.id
    );

    res.json({ newAccessToken });
  } catch (error: any) {
    return res.sendStatus(403);
  }
};

const authController = {
  refreshToken,
};

export default authController;
