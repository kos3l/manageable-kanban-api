import { ColumnDocument } from "../../../documents/ColumnDocument";
import { ICreateProjectDTO } from "../ICreateProjectDTO";

export interface ICreateModelDTO extends ICreateProjectDTO {
  columns: ColumnDocument[];
}
