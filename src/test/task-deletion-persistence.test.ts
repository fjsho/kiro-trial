import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskService } from '../services/TaskService';
import { LocalStorageTaskRepository } from '../repositories/LocalStorageTaskRepository';

describe('Task Deletion Persistence Integration Tests', () => {
  let taskService: TaskService;
  let repository: LocalStorageTaskRepository;
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });

    // Setup components
    repository = new LocalStorageTaskRepository();
    taskService = new TaskService(repository);
  });

  it('should persist task deletion to localStorage', async () => {
    // Arrange: Add some tasks first
    const task1 = await taskService.addTask('Task 1');
    const task2 = await taskService.addTask('Task 2');
    const task3 = await taskService.addTask('Task 3');

    // Verify tasks are in localStorage
    const storedTasksBefore = JSON.parse(
      mockLocalStorage['todoApp_tasks'] || '[]'
    );
    expect(storedTasksBefore).toHaveLength(3);
    expect(storedTasksBefore.find((t: any) => t.id === task2.id)).toBeDefined();

    // Act: Delete a task
    await taskService.deleteTask(task2.id);

    // Assert: Task should be removed from localStorage
    const storedTasksAfter = JSON.parse(
      mockLocalStorage['todoApp_tasks'] || '[]'
    );
    expect(storedTasksAfter).toHaveLength(2);
    expect(
      storedTasksAfter.find((t: any) => t.id === task2.id)
    ).toBeUndefined();
    expect(storedTasksAfter.find((t: any) => t.id === task1.id)).toBeDefined();
    expect(storedTasksAfter.find((t: any) => t.id === task3.id)).toBeDefined();
  });

  it('should handle deletion when localStorage is empty', async () => {
    // Arrange: Empty localStorage
    mockLocalStorage = {};

    // Act & Assert: Should throw error when trying to delete from empty storage
    await expect(taskService.deleteTask('non-existent-id')).rejects.toThrow(
      'Failed to delete task: Task with id non-existent-id not found'
    );

    // localStorage should remain empty
    expect(mockLocalStorage['todoApp_tasks']).toBeUndefined();
  });

  it('should handle deletion of non-existent task', async () => {
    // Arrange: Add one task
    const task1 = await taskService.addTask('Task 1');

    // Act & Assert: Try to delete non-existent task should throw error
    await expect(taskService.deleteTask('non-existent-id')).rejects.toThrow(
      'Failed to delete task: Task with id non-existent-id not found'
    );

    // Assert: Original task should still be in localStorage
    const storedTasks = JSON.parse(mockLocalStorage['todoApp_tasks'] || '[]');
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0].id).toBe(task1.id);
  });

  it('should maintain localStorage consistency after multiple deletions', async () => {
    // Arrange: Add multiple tasks
    const tasks = [];
    for (let i = 1; i <= 5; i++) {
      tasks.push(await taskService.addTask(`Task ${i}`));
    }

    // Act: Delete every other task
    await taskService.deleteTask(tasks[1].id);
    await taskService.deleteTask(tasks[3].id);

    // Assert: Only remaining tasks should be in localStorage
    const storedTasks = JSON.parse(mockLocalStorage['todoApp_tasks'] || '[]');
    expect(storedTasks).toHaveLength(3);
    expect(storedTasks.map((t: any) => t.id)).toEqual([
      tasks[0].id,
      tasks[2].id,
      tasks[4].id,
    ]);
  });
});
