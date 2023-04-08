import { Schema, model, Model } from "mongoose";
import { UserDocument, UserMethods } from "../documents/UserDocument";
import { UserModel } from "../types/UserModel";
const bcrypt = require("bcrypt");

let userSchema = new Schema<UserDocument, UserModel, UserMethods>(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    email: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 255,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 255,
      trim: true,
    },
    birthdate: {
      type: Date,
      required: true,
    },
    bio: {
      type: String,
      required: false,
      minlength: 6,
      maxlength: 1024,
    },
    profilePicture: {
      type: String,
      required: false,
    },
    teams: {
      type: [Schema.Types.ObjectId],
      ref: "Team",
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this;

  try {
    if (!user.isModified("password")) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    return next();
  } catch (error: any) {
    return next(error);
  }
});

userSchema.method("comparePassword", async function (password: string) {
  return bcrypt.compare(password, this.password);
});

export const User = model<UserDocument, UserModel>("user", userSchema);
