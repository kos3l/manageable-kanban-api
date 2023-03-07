export interface UserDocument {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthdate: Date;
}

export interface UserMethods {
  comparePassword(password: string): Promise<string>;
}
