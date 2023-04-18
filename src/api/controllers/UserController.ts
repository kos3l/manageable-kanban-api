import { Response } from "express";
import httpStatus from "http-status";
import { IUpdateUserDTO } from "../models/dtos/user/IUpdateUserDTO";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import userService from "../services/UserService";
import { ApiError } from "../utils/ApiError";
import userValidation from "../validations/UserValidation";

const getUserById = async (req: ExtendedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(401).send({ message: "Unauthorised" });
    }
    const user = await userService.getUserById(userId);

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json(error);
  }
};

const getUserByEmail = async (req: ExtendedRequest, res: Response) => {
  try {
    const email = req.body.email;
    const user = await userService.getUserByEmail(email);

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json(error);
  }
};

const updateOneUser = async (req: ExtendedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    let updatedUser: IUpdateUserDTO = req.body;
    delete updatedUser.teams;

    const { error } = userValidation.updateUserValidation(updatedUser);

    if (error) {
      throw new ApiError(httpStatus[400], error.details[0].message);
    }

    await userService.updateUser(userId, updatedUser);

    return res.status(201).send({ message: "User was succesfully updated." });
  } catch (error: any) {
    return res.status(500).json(error);
  }
};

const userController = {
  getUserById,
  getUserByEmail,
  updateOneUser,
};

export default userController;
