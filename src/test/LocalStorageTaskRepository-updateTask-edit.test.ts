import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageTaskRepository } from '../repositories/LocalStorageTaskRepository';
import { TaskModel } from '../models/Task';

describe('LocalStorageTaskRepository - updateTask for Edit Operations', () => {
  let repository: LocalStorageTaskRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStorageTaskRepository();
  });

  describe('updateTask method for text editing', () => {
    it('should update task text and persist to localStorage', async () => {
      // Add initial task
      const originalTask = new TaskModel('test-id', 'Original text');
      await repository.addTask(originalTask);

      // Update task text
      const updatedTask = await repository.updateTask('test-id', {
        text: 'Updated text',
      });

      // Verify returned task
      expect(updatedTask.id).toBe('test-id');
      expect(updatedTask.text).toBe('Updated text');
      expect(updatedTask.completed).toBe(false); // Should preserve other properties
      expect(updatedTask.createdAt).toEqual(originalTask.createdAt);

      // Verify persistence in localStorage
      const storedData = localStorage.getItem('todoApp_tasks');
      expect(storedData).toBeTruthy();

      const storedTasks = JSON.parse(storedData!);
      expect(storedTasks).toHaveLength(1);
      expect(storedTasks[0].text).toBe('Updated text');
      expect(storedTasks[0].id).toBe('test-id');
    });

    it('should update task text while preserving completion status', async () => {
      // Add initial completed task
      const originalTask = new TaskModel('test-id', 'Original text', true);
      await repository.addTask(originalTask);

      // Update only text, not completion status
      const updatedTask = await repository.updateTask('test-id', {
        text: 'Updated completed task',
      });

      // Verify completion status is preserved
      expect(updatedTask.text).toBe('Updated completed task');
      expect(updatedTask.completed).toBe(true); // Should preserve completion status

      // Verify persistence
      const storedTasks = JSON.parse(localStorage.getItem('todoApp_tasks')!);
      expect(storedTasks[0].text).toBe('Updated completed task');
      expect(storedTasks[0].completed).toBe(true);
    });

    it('should handle updating text with special characters and whitespace', async () => {
      // Add initial task
      const originalTask = new TaskModel('test-id', 'Simple text');
      await repository.addTask(originalTask);

      // Update with special characters and whitespace
      const specialText = '  Updated with "quotes" & <tags> and 日本語  ';
      const updatedTask = await repository.updateTask('test-id', {
        text: specialText,
      });

      // Verify text is preserved exactly as provided
      expect(updatedTask.text).toBe(specialText);

      // Verify persistence
      const storedTasks = JSON.parse(localStorage.getItem('todoApp_tasks')!);
      expect(storedTasks[0].text).toBe(specialText);
    });

    it('should handle updating text to empty string', async () => {
      // Add initial task
      const originalTask = new TaskModel('test-id', 'Original text');
      await repository.addTask(originalTask);

      // Update to empty string (repository should allow this, validation is at service level)
      const updatedTask = await repository.updateTask('test-id', { text: '' });

      // Verify empty text is stored
      expect(updatedTask.text).toBe('');

      // Verify persistence
      const storedTasks = JSON.parse(localStorage.getItem('todoApp_tasks')!);
      expect(storedTasks[0].text).toBe('');
    });

    it('should throw error when updating non-existent task text', async () => {
      // Try to update task that doesn't exist
      await expect(
        repository.updateTask('non-existent-id', { text: 'New text' })
      ).rejects.toThrow('Task with id non-existent-id not found');

      // Verify localStorage is unchanged
      const storedData = localStorage.getItem('todoApp_tasks');
      expect(storedData).toBeNull();
    });

    it('should update correct task when multiple tasks exist', async () => {
      // Add multiple tasks
      const task1 = new TaskModel('id-1', 'Task 1');
      const task2 = new TaskModel('id-2', 'Task 2');
      const task3 = new TaskModel('id-3', 'Task 3');

      await repository.addTask(task1);
      await repository.addTask(task2);
      await repository.addTask(task3);

      // Update middle task
      const updatedTask = await repository.updateTask('id-2', {
        text: 'Updated Task 2',
      });

      // Verify correct task was updated
      expect(updatedTask.id).toBe('id-2');
      expect(updatedTask.text).toBe('Updated Task 2');

      // Verify all tasks in storage
      const allTasks = await repository.getTasks();
      expect(allTasks).toHaveLength(3);

      const task1Retrieved = allTasks.find(t => t.id === 'id-1');
      const task2Retrieved = allTasks.find(t => t.id === 'id-2');
      const task3Retrieved = allTasks.find(t => t.id === 'id-3');

      expect(task1Retrieved?.text).toBe('Task 1'); // Unchanged
      expect(task2Retrieved?.text).toBe('Updated Task 2'); // Updated
      expect(task3Retrieved?.text).toBe('Task 3'); // Unchanged
    });

    it('should preserve createdAt timestamp when updating text', async () => {
      // Add initial task with specific timestamp
      const specificDate = new Date('2023-01-01T10:00:00Z');
      const originalTask = new TaskModel(
        'test-id',
        'Original text',
        false,
        specificDate
      );
      await repository.addTask(originalTask);

      // Update text
      const updatedTask = await repository.updateTask('test-id', {
        text: 'Updated text',
      });

      // Verify timestamp is preserved
      expect(updatedTask.createdAt).toEqual(specificDate);

      // Verify in storage
      const storedTasks = JSON.parse(localStorage.getItem('todoApp_tasks')!);
      expect(storedTasks[0].createdAt).toBe(specificDate.toISOString());
    });

    it('should handle partial updates correctly for edit operations', async () => {
      // Add initial task
      const originalTask = new TaskModel('test-id', 'Original text', true);
      await repository.addTask(originalTask);

      // Update only text (partial update)
      const updatedTask = await repository.updateTask('test-id', {
        text: 'New text only',
      });

      // Verify only text was updated, other properties preserved
      expect(updatedTask.id).toBe('test-id');
      expect(updatedTask.text).toBe('New text only');
      expect(updatedTask.completed).toBe(true); // Should remain true
      expect(updatedTask.createdAt).toEqual(originalTask.createdAt);

      // Verify persistence
      const storedTasks = JSON.parse(localStorage.getItem('todoApp_tasks')!);
      expect(storedTasks[0].text).toBe('New text only');
      expect(storedTasks[0].completed).toBe(true);
    });
  });
});
