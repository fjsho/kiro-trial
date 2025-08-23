import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageTaskRepository } from '../repositories/LocalStorageTaskRepository';
import { TaskModel } from '../models/Task';

describe('LocalStorageTaskRepository.deleteTask() Unit Tests', () => {
  let repository: LocalStorageTaskRepository;
  let mockLocalStorage: Record<string, string>;

  // Test constants
  const TEST_DATES = {
    FIRST: new Date('2023-01-01'),
    SECOND: new Date('2023-01-02'),
    THIRD: new Date('2023-01-03'),
    FOURTH: new Date('2023-01-04'),
    FIFTH: new Date('2023-01-05'),
  } as const;

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

    repository = new LocalStorageTaskRepository();
  });

  it('should successfully delete an existing task from localStorage', async () => {
    // Arrange: Add tasks to localStorage
    const task1 = new TaskModel('1', 'Task 1', false, TEST_DATES.FIRST);
    const task2 = new TaskModel('2', 'Task 2', true, TEST_DATES.SECOND);
    const task3 = new TaskModel('3', 'Task 3', false, TEST_DATES.THIRD);

    await repository.addTask(task1);
    await repository.addTask(task2);
    await repository.addTask(task3);

    // Act: Delete task2
    await repository.deleteTask('2');

    // Assert: task2 should be removed, others should remain
    const remainingTasks = await repository.getTasks();
    expect(remainingTasks).toHaveLength(2);
    expect(remainingTasks.find(t => t.id === '1')).toBeDefined();
    expect(remainingTasks.find(t => t.id === '2')).toBeUndefined();
    expect(remainingTasks.find(t => t.id === '3')).toBeDefined();
  });

  it('should throw error when trying to delete non-existent task', async () => {
    // Arrange: Add one task
    const task1 = new TaskModel('1', 'Task 1', false, new Date('2023-01-01'));
    await repository.addTask(task1);

    // Act & Assert: Deleting non-existent task should throw error
    await expect(repository.deleteTask('non-existent')).rejects.toThrow(
      'Failed to delete task: Task with id non-existent not found'
    );

    // Assert: Original task should still exist
    const tasks = await repository.getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('1');
  });

  it('should throw error when trying to delete from empty localStorage', async () => {
    // Arrange: Empty localStorage
    mockLocalStorage = {};

    // Act & Assert: Should throw error
    await expect(repository.deleteTask('any-id')).rejects.toThrow(
      'Failed to delete task: Task with id any-id not found'
    );
  });

  it('should handle localStorage setItem failure gracefully', async () => {
    // Arrange: Add a task first
    const task1 = new TaskModel('1', 'Task 1', false, new Date('2023-01-01'));
    await repository.addTask(task1);

    // Mock localStorage.setItem to throw error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error('Storage quota exceeded');
    });

    // Act & Assert: Should throw error with proper message
    await expect(repository.deleteTask('1')).rejects.toThrow(
      'Failed to delete task: Failed to save tasks to localStorage: Storage quota exceeded'
    );

    // Restore original setItem
    localStorage.setItem = originalSetItem;
  });

  it('should preserve task order after deletion', async () => {
    // Arrange: Add tasks in specific order
    const tasks = [
      new TaskModel('1', 'First', false, new Date('2023-01-01')),
      new TaskModel('2', 'Second', false, new Date('2023-01-02')),
      new TaskModel('3', 'Third', false, new Date('2023-01-03')),
      new TaskModel('4', 'Fourth', false, new Date('2023-01-04')),
    ];

    for (const task of tasks) {
      await repository.addTask(task);
    }

    // Act: Delete middle task
    await repository.deleteTask('2');

    // Assert: Order should be preserved
    const remainingTasks = await repository.getTasks();
    expect(remainingTasks).toHaveLength(3);
    expect(remainingTasks[0].text).toBe('First');
    expect(remainingTasks[1].text).toBe('Third');
    expect(remainingTasks[2].text).toBe('Fourth');
  });

  it('should handle deletion of completed tasks correctly', async () => {
    // Arrange: Add mix of completed and incomplete tasks
    const task1 = new TaskModel(
      '1',
      'Incomplete',
      false,
      new Date('2023-01-01')
    );
    const task2 = new TaskModel('2', 'Completed', true, new Date('2023-01-02'));
    const task3 = new TaskModel(
      '3',
      'Another Incomplete',
      false,
      new Date('2023-01-03')
    );

    await repository.addTask(task1);
    await repository.addTask(task2);
    await repository.addTask(task3);

    // Act: Delete completed task
    await repository.deleteTask('2');

    // Assert: Only incomplete tasks should remain
    const remainingTasks = await repository.getTasks();
    expect(remainingTasks).toHaveLength(2);
    expect(remainingTasks.every(t => !t.completed)).toBe(true);
    expect(remainingTasks.find(t => t.id === '2')).toBeUndefined();
  });

  it('should handle multiple consecutive deletions', async () => {
    // Arrange: Add multiple tasks
    const tasks = [];
    for (let i = 1; i <= 5; i++) {
      const task = new TaskModel(
        `${i}`,
        `Task ${i}`,
        false,
        new Date(`2023-01-0${i}`)
      );
      tasks.push(task);
      await repository.addTask(task);
    }

    // Act: Delete multiple tasks consecutively
    await repository.deleteTask('2');
    await repository.deleteTask('4');
    await repository.deleteTask('1');

    // Assert: Only tasks 3 and 5 should remain
    const remainingTasks = await repository.getTasks();
    expect(remainingTasks).toHaveLength(2);
    expect(remainingTasks.map(t => t.id).sort()).toEqual(['3', '5']);
  });
});
