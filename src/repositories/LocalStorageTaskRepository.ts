import type { Task } from "../models/Task.js";
import { TaskModel } from "../models/Task.js";
import type { TaskRepository } from "./TaskRepository.js";

interface StoredTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO string format
}

export class LocalStorageTaskRepository implements TaskRepository {
  private readonly STORAGE_KEY = "todoApp_tasks";

  private static readonly ERROR_MESSAGES = {
    ADD_FAILED: "Failed to add task",
    UPDATE_FAILED: "Failed to update task",
    DELETE_FAILED: "Failed to delete task",
    TASK_NOT_FOUND: "Task not found",
    STORAGE_FAILED: "Failed to save tasks to localStorage",
    LOAD_FAILED: "Failed to load tasks from localStorage",
  } as const;

  async addTask(task: Task): Promise<Task> {
    try {
      const tasks = await this.getTasks();
      tasks.push(task);
      this.saveTasks(tasks);
      return task;
    } catch (error) {
      throw new Error(
        `${
          LocalStorageTaskRepository.ERROR_MESSAGES.ADD_FAILED
        }: ${this.getErrorMessage(error)}`
      );
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const tasks = await this.getTasks();
      const taskIndex = tasks.findIndex((task) => task.id === id);

      if (taskIndex === -1) {
        throw new Error(`Task with id ${id} not found`);
      }

      const updatedTask = { ...tasks[taskIndex], ...updates };
      tasks[taskIndex] = updatedTask;
      this.saveTasks(tasks);
      return updatedTask;
    } catch (error) {
      throw new Error(
        `Failed to update task: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter((task) => task.id !== id);

      if (filteredTasks.length === tasks.length) {
        throw new Error(`Task with id ${id} not found`);
      }

      this.saveTasks(filteredTasks);
    } catch (error) {
      throw new Error(
        `Failed to delete task: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getTasks(): Promise<Task[]> {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);

      if (!storedData) {
        return [];
      }

      const storedTasks: StoredTask[] = JSON.parse(storedData);
      return storedTasks.map(this.deserializeTask);
    } catch (error) {
      console.error("Failed to load tasks from localStorage:", error);
      // Return empty array instead of throwing to allow app to continue functioning
      return [];
    }
  }

  private saveTasks(tasks: Task[]): void {
    try {
      const storedTasks: StoredTask[] = tasks.map(this.serializeTask);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedTasks));
    } catch (error) {
      throw new Error(
        `Failed to save tasks to localStorage: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private serializeTask(task: Task): StoredTask {
    return {
      id: task.id,
      text: task.text,
      completed: task.completed,
      createdAt: task.createdAt.toISOString(),
    };
  }

  private deserializeTask(storedTask: StoredTask): Task {
    return new TaskModel(
      storedTask.id,
      storedTask.text,
      storedTask.completed,
      new Date(storedTask.createdAt)
    );
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unknown error";
  }
}
