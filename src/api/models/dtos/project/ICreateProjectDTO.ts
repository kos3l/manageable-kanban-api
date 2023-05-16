export interface ICreateProjectDTO {
  name: string;
  description?: string;
  techStack: string[];
  startDate: Date;
  endDate: Date;
  teamId: string;
}
