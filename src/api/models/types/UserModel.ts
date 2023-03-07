import { Model } from "mongoose";
import { UserDocument, UserMethods } from "../documents/UserDocument";

export type UserModel = Model<UserDocument, {}, UserMethods>;
