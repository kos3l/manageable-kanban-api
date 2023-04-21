import Joi from "joi";
import { IUpdateUserDTO } from "../models/dtos/user/IUpdateUserDTO";

const updateUserValidation = (data: IUpdateUserDTO) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(255),
    lastName: Joi.string().min(3).max(255),
    bio: Joi.string().min(6).max(1024),
    birthdate: Joi.date(),
  });
  return schema.validate(data);
};

const userValidation = {
  updateUserValidation,
};
export default userValidation;
