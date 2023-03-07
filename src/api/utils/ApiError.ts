import { IApiError } from "../models/util/IApiError";

class ApiError implements IApiError {
  // probably should extend error class look into this
  statusCode: string;
  message: string;

  constructor(statusCode: string, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = ApiError;
