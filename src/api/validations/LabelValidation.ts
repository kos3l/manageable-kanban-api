import Joi from "joi";
import { ICreateLabelDTO } from "../models/dtos/label/ICreateLabelDTO";

const createLabelValidation = (data: ICreateLabelDTO) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    color: Joi.string().min(3).max(24).required(),
  });
  return schema.validate(data);
};

const labelValidation = {
  createLabelValidation,
};
export default labelValidation;
