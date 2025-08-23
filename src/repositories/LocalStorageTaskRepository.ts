import type { Task } from '../models/Task.js';
import { TaskModel } from '../models/Task.js';
import type { TaskRepository } from './TaskRepository.js';

interface StoredTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO string format
}

export class LocalStorageTaskRepository implements TaskRepository {
  private readonly STORAGE_KEY = 'todoApp_tasks';

  private static readonly ERROR_MESSAGES = {
    ADD_FAILED: 'Failed to add task',
    UPDATE_FAILED: 'Failed to update task',
    DELETE_FAILED: 'Failed to delete task',
    TASK_NOT_FOUND: 'Task not found',
    STORAGE_FAILED: 'Failed to save tasks to localStorage',
    LOAD_FAILED: 'Failed to load tasks from localStorage',
    INVALID_DATA_FORMAT: 'Invalid data format in localStorage: expected array',
    INVALID_TASK_STRUCTURE: 'Invalid stored task structure',
    INVALID_DATE: 'Invalid createdAt date',
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
      const taskIndex = tasks.findIndex(task => task.id === id);

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
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter(task => task.id !== id);

      if (filteredTasks.length === tasks.length) {
        throw new Error(`Task with id ${id} not found`);
      }

      this.saveTasks(filteredTasks);
    } catch (error) {
      throw new Error(
        `Failed to delete task: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Retrieves all tasks from localStorage with robust error handling and data validation.
   *
   * This method handles various error scenarios gracefully:
   * - Empty or missing localStorage data
   * - Corrupted JSON data
   * - Invalid task structures
   * - Invalid date formats
   * - localStorage access errors
   *
   * @returns Promise<Task[]> Array of valid tasks, or empty array if no valid tasks found
   */
  async getTasks(): Promise<Task[]> {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);

      if (!storedData) {
        return [];
      }

      const parsedData = JSON.parse(storedData);

      // Validate that parsed data is an array
      if (!Array.isArray(parsedData)) {
        console.error(
          LocalStorageTaskRepository.ERROR_MESSAGES.INVALID_DATA_FORMAT
        );
        return [];
      }

      const storedTasks: StoredTask[] = parsedData;

      // Filter and deserialize only valid tasks
      const validTasks: Task[] = [];
      for (const storedTask of storedTasks) {
        try {
          const task = this.deserializeTask(storedTask);
          if (this.isValidTask(task)) {
            validTasks.push(task);
          }
        } catch (error) {
          console.warn('Skipping invalid task during deserialization:', error);
          // Continue processing other tasks
        }
      }

      return validTasks;
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);

      // If it's a security error, throw the error to show user feedback
      if (error instanceof Error && error.message.includes('SecurityError')) {
        throw new Error(
          `Failed to load tasks from localStorage: ${error.message}`
        );
      }

      // For other errors (like JSON parsing), return empty array to allow app to continue functioning
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
          error instanceof Error ? error.message : 'Unknown error'
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
    // Validate required fields exist and are of correct type
    if (!this.isValidStoredTask(storedTask)) {
      throw new Error(
        LocalStorageTaskRepository.ERROR_MESSAGES.INVALID_TASK_STRUCTURE
      );
    }

    const createdAt = new Date(storedTask.createdAt);

    // Validate that the date is valid - skip invalid tasks to maintain data integrity
    if (isNaN(createdAt.getTime())) {
      throw new Error(LocalStorageTaskRepository.ERROR_MESSAGES.INVALID_DATE);
    }

    return new TaskModel(
      storedTask.id,
      storedTask.text,
      storedTask.completed,
      createdAt
    );
  }

  /**
   * Validates that a stored task object has all required fields with correct types.
   *
   * @param storedTask - The object to validate
   * @returns true if the object is a valid StoredTask, false otherwise
   */
  private isValidStoredTask(storedTask: any): storedTask is StoredTask {
    return (
      typeof storedTask === 'object' &&
      storedTask !== null &&
      typeof storedTask.id === 'string' &&
      storedTask.id.length > 0 &&
      typeof storedTask.text === 'string' &&
      storedTask.text.length > 0 &&
      typeof storedTask.completed === 'boolean' &&
      typeof storedTask.createdAt === 'string' &&
      storedTask.createdAt.length > 0
    );
  }

  /**
   * Validates that a deserialized task object is valid and complete.
   *
   * @param task - The Task object to validate
   * @returns true if the task is valid, false otherwise
   */
  private isValidTask(task: Task): boolean {
    return (
      typeof task.id === 'string' &&
      task.id.length > 0 &&
      typeof task.text === 'string' &&
      task.text.length > 0 &&
      typeof task.completed === 'boolean' &&
      task.createdAt instanceof Date &&
      !isNaN(task.createdAt.getTime())
    );
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
