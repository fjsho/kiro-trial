import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskService } from '../services/TaskService.js';
import type { TaskRepository } from '../repositories/TaskRepository.js';
import { TaskModel } from '../models/Task.js';

describe('TaskService Delete Task Statistics Unit Tests', () => {
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

  it('should calculate correct stats after deleting an incomplete task', async () => {
    // Arrange - Initial state: 3 tasks, 1 completed
    const initialTasks = [
      new TaskModel('1', 'Task 1', false), // incomplete - will be deleted
      new TaskModel('2', 'Task 2', true), // completed
      new TaskModel('3', 'Task 3', false), // incomplete
    ];

    // After deletion: 2 tasks, 1 completed
    const tasksAfterDeletion = [
      new TaskModel('2', 'Task 2', true), // completed
      new TaskModel('3', 'Task 3', false), // incomplete
    ];

    vi.mocked(mockRepository.deleteTask).mockResolvedValue();
    vi.mocked(mockRepository.getTasks).mockResolvedValue(tasksAfterDeletion);

    // Act
    await taskService.deleteTask('1');
    const stats = await taskService.getTaskStats();

    // Assert
    expect(mockRepository.deleteTask).toHaveBeenCalledWith('1');
    expect(stats).toEqual({
      total: 2,
      completed: 1,
      active: 1,
    });
  });

  it('should calculate correct stats after deleting a completed task', async () => {
    // Arrange - Initial state: 3 tasks, 2 completed
    const initialTasks = [
      new TaskModel('1', 'Task 1', true), // completed - will be deleted
      new TaskModel('2', 'Task 2', true), // completed
      new TaskModel('3', 'Task 3', false), // incomplete
    ];

    // After deletion: 2 tasks, 1 completed
    const tasksAfterDeletion = [
      new TaskModel('2', 'Task 2', true), // completed
      new TaskModel('3', 'Task 3', false), // incomplete
    ];

    vi.mocked(mockRepository.deleteTask).mockResolvedValue();
    vi.mocked(mockRepository.getTasks).mockResolvedValue(tasksAfterDeletion);

    // Act
    await taskService.deleteTask('1');
    const stats = await taskService.getTaskStats();

    // Assert
    expect(mockRepository.deleteTask).toHaveBeenCalledWith('1');
    expect(stats).toEqual({
      total: 2,
      completed: 1,
      active: 1,
    });
  });

  it('should calculate correct stats after deleting the last task', async () => {
    // Arrange - Initial state: 1 task
    const initialTasks = [
      new TaskModel('1', 'Last task', false), // will be deleted
    ];

    // After deletion: 0 tasks
    const tasksAfterDeletion: TaskModel[] = [];

    vi.mocked(mockRepository.deleteTask).mockResolvedValue();
    vi.mocked(mockRepository.getTasks).mockResolvedValue(tasksAfterDeletion);

    // Act
    await taskService.deleteTask('1');
    const stats = await taskService.getTaskStats();

    // Assert
    expect(mockRepository.deleteTask).toHaveBeenCalledWith('1');
    expect(stats).toEqual({
      total: 0,
      completed: 0,
      active: 0,
    });
  });

  it('should calculate correct stats after deleting one of many completed tasks', async () => {
    // Arrange - Initial state: 5 tasks, 3 completed
    const initialTasks = [
      new TaskModel('1', 'Task 1', true), // completed - will be deleted
      new TaskModel('2', 'Task 2', true), // completed
      new TaskModel('3', 'Task 3', false), // incomplete
      new TaskModel('4', 'Task 4', true), // completed
      new TaskModel('5', 'Task 5', false), // incomplete
    ];

    // After deletion: 4 tasks, 2 completed
    const tasksAfterDeletion = [
      new TaskModel('2', 'Task 2', true), // completed
      new TaskModel('3', 'Task 3', false), // incomplete
      new TaskModel('4', 'Task 4', true), // completed
      new TaskModel('5', 'Task 5', false), // incomplete
    ];

    vi.mocked(mockRepository.deleteTask).mockResolvedValue();
    vi.mocked(mockRepository.getTasks).mockResolvedValue(tasksAfterDeletion);

    // Act
    await taskService.deleteTask('1');
    const stats = await taskService.getTaskStats();

    // Assert
    expect(mockRepository.deleteTask).toHaveBeenCalledWith('1');
    expect(stats).toEqual({
      total: 4,
      completed: 2,
      active: 2,
    });
  });

  it('should calculate correct stats after deleting one of many incomplete tasks', async () => {
    // Arrange - Initial state: 5 tasks, 2 completed
    const initialTasks = [
      new TaskModel('1', 'Task 1', false), // incomplete - will be deleted
      new TaskModel('2', 'Task 2', true), // completed
      new TaskModel('3', 'Task 3', false), // incomplete
      new TaskModel('4', 'Task 4', true), // completed
      new TaskModel('5', 'Task 5', false), // incomplete
    ];

    // After deletion: 4 tasks, 2 completed
    const tasksAfterDeletion = [
      new TaskModel('2', 'Task 2', true), // completed
      new TaskModel('3', 'Task 3', false), // incomplete
      new TaskModel('4', 'Task 4', true), // completed
      new TaskModel('5', 'Task 5', false), // incomplete
    ];

    vi.mocked(mockRepository.deleteTask).mockResolvedValue();
    vi.mocked(mockRepository.getTasks).mockResolvedValue(tasksAfterDeletion);

    // Act
    await taskService.deleteTask('1');
    const stats = await taskService.getTaskStats();

    // Assert
    expect(mockRepository.deleteTask).toHaveBeenCalledWith('1');
    expect(stats).toEqual({
      total: 4,
      completed: 2,
      active: 2,
    });
  });

  it('should handle deletion errors and not affect statistics calculation', async () => {
    // Arrange
    const error = new Error('Delete operation failed');
    vi.mocked(mockRepository.deleteTask).mockRejectedValue(error);

    // Act & Assert
    await expect(taskService.deleteTask('1')).rejects.toThrow(
      'Delete operation failed'
    );
    expect(mockRepository.deleteTask).toHaveBeenCalledWith('1');

    // getTasks should not be called if deletion fails
    expect(mockRepository.getTasks).not.toHaveBeenCalled();
  });

  it('should calculate stats correctly after multiple deletions', async () => {
    // Arrange - Simulate multiple deletions
    const tasksAfterFirstDeletion = [
      new TaskModel('2', 'Task 2', true), // completed
      new TaskModel('3', 'Task 3', false), // incomplete
      new TaskModel('4', 'Task 4', true), // completed
    ];

    const tasksAfterSecondDeletion = [
      new TaskModel('3', 'Task 3', false), // incomplete
      new TaskModel('4', 'Task 4', true), // completed
    ];

    vi.mocked(mockRepository.deleteTask).mockResolvedValue();

    // First deletion
    vi.mocked(mockRepository.getTasks).mockResolvedValueOnce(
      tasksAfterFirstDeletion
    );
    await taskService.deleteTask('1');
    let stats = await taskService.getTaskStats();

    expect(stats).toEqual({
      total: 3,
      completed: 2,
      active: 1,
    });

    // Second deletion
    vi.mocked(mockRepository.getTasks).mockResolvedValueOnce(
      tasksAfterSecondDeletion
    );
    await taskService.deleteTask('2');
    stats = await taskService.getTaskStats();

    expect(stats).toEqual({
      total: 2,
      completed: 1,
      active: 1,
    });

    // Assert both deletions were called
    expect(mockRepository.deleteTask).toHaveBeenCalledTimes(2);
    expect(mockRepository.deleteTask).toHaveBeenNthCalledWith(1, '1');
    expect(mockRepository.deleteTask).toHaveBeenNthCalledWith(2, '2');
  });
});
