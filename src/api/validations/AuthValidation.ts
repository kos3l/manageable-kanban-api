import { ICreateUserDTO } from "../models/dtos/user/ICreateUserDTO";
import { ICreateLoginDTO } from "../models/dtos/user/ICreateLoginDTO";

const Joi = require("joi");

const registerValidation = (data: ICreateUserDTO) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(255).required(),
    lastName: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(6).max(255).required(),
    password: Joi.string().min(6).max(255).required(),
    birthdate: Joi.date().required(),
  });
  return schema.validate(data);
};

const loginValidation = (data: ICreateLoginDTO) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required(),
    password: Joi.string().min(6).max(255).required(),
  });
  return schema.validate(data);
};

module.exports = { registerValidation, loginValidation };
