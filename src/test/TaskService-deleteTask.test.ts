import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskService } from '../services/TaskService.js';
import type { TaskRepository } from '../repositories/TaskRepository.js';
import { TaskModel } from '../models/Task.js';

describe('TaskService.deleteTask() Unit Tests', () => {
  let taskService: TaskService;
  let mockRepository: TaskRepository;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      getTasks: vi.fn(),
    };

    taskService = new TaskService(mockRepository);
  });

  it('should call repository.deleteTask with correct task ID', async () => {
    // Arrange
    const taskId = 'test-task-id';
    mockRepository.deleteTask = vi.fn().mockResolvedValue(undefined);

    // Act
    await taskService.deleteTask(taskId);

    // Assert
    expect(mockRepository.deleteTask).toHaveBeenCalledOnce();
    expect(mockRepository.deleteTask).toHaveBeenCalledWith(taskId);
  });

  it('should propagate repository errors', async () => {
    // Arrange
    const taskId = 'test-task-id';
    const repositoryError = new Error('Repository delete failed');
    mockRepository.deleteTask = vi.fn().mockRejectedValue(repositoryError);

    // Act & Assert
    await expect(taskService.deleteTask(taskId)).rejects.toThrow(
      'Repository delete failed'
    );
    expect(mockRepository.deleteTask).toHaveBeenCalledWith(taskId);
  });

  it('should throw error for empty task ID', async () => {
    // Arrange
    const taskId = '';

    // Act & Assert
    await expect(taskService.deleteTask(taskId)).rejects.toThrow(
      'Task ID is required and must be a string'
    );
  });

  it('should throw error for null task ID', async () => {
    // Arrange
    const taskId = null as any;

    // Act & Assert
    await expect(taskService.deleteTask(taskId)).rejects.toThrow(
      'Task ID is required and must be a string'
    );
  });

  it('should throw error for undefined task ID', async () => {
    // Arrange
    const taskId = undefined as any;

    // Act & Assert
    await expect(taskService.deleteTask(taskId)).rejects.toThrow(
      'Task ID is required and must be a string'
    );
  });

  it('should not return any value', async () => {
    // Arrange
    const taskId = 'test-task-id';
    mockRepository.deleteTask = vi.fn().mockResolvedValue(undefined);

    // Act
    const result = await taskService.deleteTask(taskId);

    // Assert
    expect(result).toBeUndefined();
  });
});
