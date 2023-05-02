import { ColumnDocument } from "../../documents/ColumnDocument";

export interface IUpdateProjectDTO {
  name?: string;
  description?: string;
  techStack?: string[];
  startDate?: Date;
  endDate?: Date;
  columns?: ColumnDocument[];
}
