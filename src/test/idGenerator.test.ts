import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateUniqueId, generateTaskId } from "../utils/idGenerator";

describe("idGenerator", () => {
  describe("generateUniqueId", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should generate a unique ID with timestamp and random component", () => {
      const mockTime = 1234567890123;
      vi.setSystemTime(mockTime);

      const id = generateUniqueId();

      expect(id).toMatch(/^\d+-[a-z0-9]{9}$/);
      expect(id).toContain(mockTime.toString());
    });

    it("should generate different IDs when called multiple times", () => {
      vi.useRealTimers(); // Use real timers for this test to ensure randomness

      const ids = new Set();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const id = generateUniqueId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }

      expect(ids.size).toBe(iterations);
    });

    it("should generate IDs with different timestamps when called at different times", () => {
      const time1 = 1234567890123;
      const time2 = 1234567890124;

      vi.setSystemTime(time1);
      const id1 = generateUniqueId();

      vi.setSystemTime(time2);
      const id2 = generateUniqueId();

      expect(id1).not.toBe(id2);
      expect(id1.split("-")[0]).toBe(time1.toString());
      expect(id2.split("-")[0]).toBe(time2.toString());
    });

    it("should generate IDs with 9-character random suffix", () => {
      const id = generateUniqueId();
      const parts = id.split("-");

      expect(parts).toHaveLength(2);
      expect(parts[1]).toHaveLength(9);
      expect(parts[1]).toMatch(/^[a-z0-9]{9}$/);
    });
  });

  describe("generateTaskId", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate a task ID with "task-" prefix', () => {
      const taskId = generateTaskId();

      expect(taskId).toMatch(/^task-\d+-[a-z0-9]{9}$/);
      expect(taskId.startsWith("task-")).toBe(true);
    });

    it("should generate different task IDs when called multiple times", () => {
      vi.useRealTimers(); // Use real timers for this test to ensure randomness

      const taskIds = new Set();
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const taskId = generateTaskId();
        expect(taskIds.has(taskId)).toBe(false);
        taskIds.add(taskId);
      }

      expect(taskIds.size).toBe(iterations);
    });

    it("should have correct format structure", () => {
      const mockTime = 1234567890123;
      vi.setSystemTime(mockTime);

      const taskId = generateTaskId();
      const expectedPattern = `task-${mockTime}-`;

      expect(taskId.startsWith(expectedPattern)).toBe(true);

      // Extract the random part after the timestamp
      const randomPart = taskId.substring(expectedPattern.length);
      expect(randomPart).toHaveLength(9);
      expect(randomPart).toMatch(/^[a-z0-9]{9}$/);
    });

    it("should use generateUniqueId internally", () => {
      const mockTime = 1234567890123;
      vi.setSystemTime(mockTime);

      const taskId = generateTaskId();

      // Verify that the taskId follows the expected pattern from generateUniqueId
      expect(taskId).toMatch(/^task-\d+-[a-z0-9]{9}$/);
      expect(taskId.startsWith(`task-${mockTime}-`)).toBe(true);

      // Extract and verify the random part has the same format as generateUniqueId
      const randomPart = taskId.split("-")[2];
      expect(randomPart).toHaveLength(9);
      expect(randomPart).toMatch(/^[a-z0-9]{9}$/);
    });
  });
});
