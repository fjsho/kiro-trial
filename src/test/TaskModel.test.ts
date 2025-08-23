import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TaskModel } from '../models/Task';

describe('TaskModel', () => {
  describe('constructor', () => {
    it('should create a task with provided id and text', () => {
      const id = 'test-id';
      const text = 'Test task';

      const task = new TaskModel(id, text);

      expect(task.id).toBe(id);
      expect(task.text).toBe(text);
    });

    it('should create a task with all provided parameters', () => {
      const id = 'test-id';
      const text = 'Test task';
      const completed = true;
      const createdAt = new Date('2023-01-01');

      const task = new TaskModel(id, text, completed, createdAt);

      expect(task.id).toBe(id);
      expect(task.text).toBe(text);
      expect(task.completed).toBe(completed);
      expect(task.createdAt).toBe(createdAt);
    });
  });

  describe('default values', () => {
    beforeEach(() => {
      // Mock Date.now() to ensure consistent test results
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should set completed to false by default', () => {
      const task = new TaskModel('test-id', 'Test task');

      expect(task.completed).toBe(false);
    });

    it('should set createdAt to current date by default', () => {
      const task = new TaskModel('test-id', 'Test task');

      expect(task.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
    });

    it('should use default values when only id and text are provided', () => {
      const task = new TaskModel('test-id', 'Test task');

      expect(task.id).toBe('test-id');
      expect(task.text).toBe('Test task');
      expect(task.completed).toBe(false);
      expect(task.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
    });

    it('should use default createdAt when completed is provided but createdAt is not', () => {
      const task = new TaskModel('test-id', 'Test task', true);

      expect(task.id).toBe('test-id');
      expect(task.text).toBe('Test task');
      expect(task.completed).toBe(true);
      expect(task.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
    });
  });

  describe('Task interface compliance', () => {
    it('should implement all Task interface properties', () => {
      const task = new TaskModel('test-id', 'Test task');

      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('text');
      expect(task).toHaveProperty('completed');
      expect(task).toHaveProperty('createdAt');

      expect(typeof task.id).toBe('string');
      expect(typeof task.text).toBe('string');
      expect(typeof task.completed).toBe('boolean');
      expect(task.createdAt).toBeInstanceOf(Date);
    });
  });
});
