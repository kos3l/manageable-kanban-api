import { IApiError } from "../models/util/IApiError";

export class ApiError implements IApiError {
  // probably should extend error class look into this
  statusCode: string;
  message: string;

  constructor(statusCode: string, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }
}
