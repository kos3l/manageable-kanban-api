import mongoose from "mongoose";

export interface IUpdateTaskOrderDTO {
  columnId: string;
  projectId: string;
  tasks: string[];
}
