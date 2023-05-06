import { IUpdateProjectDTO } from "../project/IUpdateProjectDTO";
import { IUpdateTeamDTO } from "./IUpdateTeamDTO";
import { IUpdateTeamProjectsDTO } from "./IUpdateTeamProjectsDTO";
import { IUpdateTeamUsersDTO } from "./IUpdateTeamUsersDTO";

export interface IUpdateTeamModel
  extends IUpdateTeamDTO,
    IUpdateTeamProjectsDTO,
    IUpdateTeamUsersDTO {}
