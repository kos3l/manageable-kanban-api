import userService from "../services/UserService";
import authValidation from "../validations/AuthValidation";
import { ICreateUserDTO } from "../models/dtos/user/ICreateUserDTO";
import { ICreateLoginDTO } from "../models/dtos/user/ICreateLoginDTO";

const register = async (userBody: ICreateUserDTO) => {
  const { error } = authValidation.registerValidation(userBody);

  if (error) {
    throw new Error(error.details[0].message);
  }

  const emailExist = await userService.getUserByEmail(userBody.email);

  if (emailExist) {
    throw new Error("Email already exists");
  }

  const newUser = await userService.createNewUser(userBody);

  return newUser;
};

const login = async (userBody: ICreateLoginDTO) => {
  const { error } = authValidation.loginValidation(userBody);

  if (error) {
    throw new Error(error.details[0].message);
  }

  const fetchedUser = await userService.getUserByEmail(userBody.email);

  if (!fetchedUser) {
    throw new Error("Email is wrong");
  }

  const validPassword: string = await fetchedUser.comparePassword(
    userBody.password
  );

  if (!validPassword) {
    throw new Error("Wrong password");
  }
  return fetchedUser;
};

const authService = {
  register,
  login,
};

export default authService;
