import type { Task } from "../models/Task.js";

export interface TaskRepository {
  addTask(task: Task): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  getTasks(): Promise<Task[]>;
}
