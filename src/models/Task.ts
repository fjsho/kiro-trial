export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export class TaskModel implements Task {
  constructor(
    public id: string,
    public text: string,
    public completed: boolean = false,
    public createdAt: Date = new Date()
  ) {}
}
