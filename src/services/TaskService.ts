import type { Task } from "../models/Task.js";
import { TaskModel } from "../models/Task.js";
import type { TaskRepository } from "../repositories/TaskRepository.js";
import { generateTaskId } from "../utils/idGenerator.js";

export type FilterType = "all" | "active" | "completed";

/**
 * Interface representing task statistics
 */
export interface TaskStats {
  /** Total number of tasks */
  total: number;
  /** Number of completed tasks */
  completed: number;
  /** Number of active (incomplete) tasks */
  active: number;
}

// Constants for task validation
const TASK_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 500,
} as const;

export class TaskService {
  constructor(private repository: TaskRepository) {}

  async addTask(text: string): Promise<Task> {
    this.validateTaskText(text);

    const task = new TaskModel(generateTaskId(), text.trim());
    return await this.repository.addTask(task);
  }

  private validateTaskText(text: string): void {
    const trimmedText = text?.trim() || "";

    if (trimmedText.length < TASK_VALIDATION.MIN_LENGTH) {
      throw new Error("Task text cannot be empty");
    }

    if (text.length > TASK_VALIDATION.MAX_LENGTH) {
      throw new Error(
        `Task text cannot exceed ${TASK_VALIDATION.MAX_LENGTH} characters`
      );
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return await this.repository.updateTask(id, updates);
  }

  async deleteTask(id: string): Promise<void> {
    if (!id || typeof id !== "string") {
      throw new Error("Task ID is required and must be a string");
    }

    await this.repository.deleteTask(id);
  }

  async toggleTask(id: string): Promise<Task> {
    const tasks = await this.repository.getTasks();
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }

    return await this.repository.updateTask(id, { completed: !task.completed });
  }

  async getTasks(): Promise<Task[]> {
    return await this.repository.getTasks();
  }

  async getFilteredTasks(filter: FilterType): Promise<Task[]> {
    const tasks = await this.getTasks();

    switch (filter) {
      case "active":
        return tasks.filter((task) => !task.completed);
      case "completed":
        return tasks.filter((task) => task.completed);
      case "all":
      default:
        return tasks;
    }
  }

  /**
   * Calculates and returns statistics about the current tasks.
   *
   * @returns Promise<TaskStats> Object containing total, completed, and active task counts
   * @throws Error if repository fails to retrieve tasks
   */
  async getTaskStats(): Promise<TaskStats> {
    const tasks = await this.getTasks();
    const completed = tasks.filter((task) => task.completed).length;
    const total = tasks.length;
    const active = total - completed;

    return { total, completed, active };
  }
}
