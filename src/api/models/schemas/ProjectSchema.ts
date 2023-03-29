import { Schema, model } from "mongoose";
import { ProjectDocument } from "../documents/ProjectDocument";
import { TeamDocument } from "../documents/TeamDocument";
import { ProjectStatus } from "../enum/ProjectStatus";

let projectSchema = new Schema<ProjectDocument>(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 255,
    },
    description: {
      type: String,
      required: false,
      min: 3,
      max: 1056,
    },
    // will be updated
    techStack: {
      type: [String],
      required: true,
    },
    status: {
      type: Number,
      required: true,
      enum: ProjectStatus,
      default: ProjectStatus.NOTSTARTED,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const Project = model<TeamDocument>("project", projectSchema);
