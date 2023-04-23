import { Response } from "express";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import userService from "../services/UserService";
const jwt = require("jsonwebtoken");

const refreshToken = async (req: ExtendedRequest, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(401);
  }
  const refreshToken = cookies.jwt;
  const userWithThisRefreshToken = await userService.getUserByRefreshToken(
    refreshToken
  );

  if (!userWithThisRefreshToken) {
    return res.sendStatus(403);
  } //Forbidden

  // evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err: any, decoded: any) => {
      if (err || userWithThisRefreshToken.id !== decoded.id) {
        return res.sendStatus(403);
      }
      const accessToken = jwt.sign(
        { name: decoded.name, id: decoded.id },
        process.env.TOKEN_SECRET,
        { expiresIn: "30s" }
      );
      res.json({ accessToken });
    }
  );
};

const authController = {
  refreshToken,
};

export default authController;
