import { IUpdateColumnDTO } from "./IUpdateColumnsDTO";

export interface IUpdateProjectDTO {
  name?: string;
  description?: string;
  techStack?: string[];
  startDate?: Date;
  endDate?: Date;
  columns?: IUpdateColumnDTO[];
}
