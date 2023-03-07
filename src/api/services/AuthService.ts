const userService = require("../services/UserService");
const {
  registerValidation,
  loginValidation,
} = require("../validations/AuthValidation");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
import { ICreateUserDTO } from "../models/dtos/user/ICreateUserDTO";
import { ICreateLoginDTO } from "../models/dtos/user/ICreateLoginDTO";
import { HydratedDocument } from "mongoose";
import { UserDocument, UserMethods } from "../models/documents/UserDocument";

const register = async (
  userBody: ICreateUserDTO
): Promise<HydratedDocument<UserDocument, UserMethods> | null> => {
  const { error } = registerValidation(userBody);
  if (error) {
    throw new ApiError(httpStatus[400], error.details[0].message);
  }

  const emailExist: HydratedDocument<UserDocument, UserMethods> =
    await userService.getUserByEmail(userBody.email);
  if (emailExist) {
    throw new ApiError(httpStatus[400], "Email already exists");
  }
  const newUser: HydratedDocument<UserDocument, UserMethods> =
    await userService.createNewUser(userBody);
  return newUser;
};

const login = async (
  userBody: ICreateLoginDTO
): Promise<HydratedDocument<UserDocument, UserMethods> | null> => {
  const { error } = loginValidation(userBody);
  if (error) {
    throw new ApiError(httpStatus[400], error.details[0].message);
  }

  const fetchedUser: HydratedDocument<UserDocument, UserMethods> | null =
    await userService.getUserByEmail(userBody.email);

  if (!fetchedUser) {
    throw new ApiError(httpStatus[400], "Email is wrong");
  }

  const validPassword: string = await fetchedUser.comparePassword(
    userBody.password
  );

  if (!validPassword) {
    throw new ApiError(httpStatus[400], "Wrong password");
  }
  return fetchedUser;
};

module.exports = {
  register,
  login,
};
