import { UserDocument } from "../models/documents/UserDocument";
import { IUpdateUserDTO } from "../models/dtos/user/IUpdateUserDTO";

export class UserHelper {
  static createUpdateUserDTO(user: UserDocument): IUpdateUserDTO {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      birthdate: user.birthdate,
    };
  }
}
