import { UserDocument } from "../documents/UserDocument";
import { Request } from "express";

export interface ExtendedRequest extends Request {
  user?: string;
}
