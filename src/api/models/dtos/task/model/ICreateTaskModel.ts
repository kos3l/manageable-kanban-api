import { ICreateTaskDTO } from "../ICreateTaskDTO";

export interface ICreateTaskModel extends ICreateTaskDTO {
  projectId: string;
}
