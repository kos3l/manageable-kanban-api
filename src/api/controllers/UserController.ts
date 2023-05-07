import { Response } from "express";
import { IUpdateUserDTO } from "../models/dtos/user/IUpdateUserDTO";
import { ExtendedRequest } from "../models/util/IExtendedRequest";
import userService from "../services/UserService";
import userValidation from "../validations/UserValidation";

const getUserById = async (req: ExtendedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId, null);

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json(error);
  }
};

const getLoggedInUserProfile = async (req: ExtendedRequest, res: Response) => {
  try {
    const id = req.user!;
    const user = await userService.getUserById(id, null);

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

    const { error } = userValidation.updateUserValidation(updatedUser);

    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    await userService.updateUser(userId, updatedUser, null);

    return res.status(204).send({ message: "User was succesfully updated." });
  } catch (error: any) {
    return res.status(500).json(error);
  }
};

const userController = {
  getUserById,
  getUserByEmail,
  updateOneUser,
  getLoggedInUserProfile,
};

export default userController;
