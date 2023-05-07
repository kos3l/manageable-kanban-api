export interface ICreateTaskDTO {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  columnId: string;
}
