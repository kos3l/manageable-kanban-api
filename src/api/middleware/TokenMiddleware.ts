const jwt = require("jsonwebtoken");
import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../models/util/IExtendedRequest";

export const verifyToken = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json({ message: "No token found" });

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
