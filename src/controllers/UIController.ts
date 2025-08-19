import type { Task } from "../models/Task.js";
import { TaskService } from "../services/TaskService.js";
import { LocalStorageTaskRepository } from "../repositories/LocalStorageTaskRepository.js";

// Constants for validation
const VALIDATION_RULES = {
  MIN_TASK_LENGTH: 1,
  MAX_TASK_LENGTH: 500,
} as const;

export class UIController {
  private taskList!: HTMLElement;
  private taskForm!: HTMLFormElement;
  private taskInput!: HTMLInputElement;
  private taskService: TaskService;

  constructor() {
    // Initialize dependencies
    const repository = new LocalStorageTaskRepository();
    this.taskService = new TaskService(repository);

    this.initializeElements();
    this.bindEvents();
    this.loadInitialTasks();
  }

  private initializeElements(): void {
    this.taskList = this.getRequiredElement("task-list");
    this.taskForm = this.getRequiredElement("add-task-form") as HTMLFormElement;
    this.taskInput = this.getRequiredElement(
      "new-task-input"
    ) as HTMLInputElement;
  }

  private getRequiredElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Required element with id '${id}' not found`);
    }
    return element;
  }

  private bindEvents(): void {
    this.taskForm.addEventListener("submit", this.handleAddTask.bind(this));
    this.taskInput.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  private handleAddTask(event: Event): void {
    event.preventDefault();
    this.processTaskAddition();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.isComposing) {
      event.preventDefault();
      this.processTaskAddition();
    }
  }

  private async processTaskAddition(): Promise<void> {
    const validatedText = this.getValidatedTaskText();

    if (validatedText === null) {
      // If validation fails, input field is not cleared to allow user to fix the input
      return;
    }

    try {
      const task = await this.taskService.addTask(validatedText);
      this.addTaskToDOM(task);
      this.clearInput();

      // Update UI state after adding task
      await this.refreshUI();
    } catch (error) {
      this.handleTaskError("Failed to add task", error);
    }
  }

  private getValidatedTaskText(): string | null {
    const text = this.taskInput.value.trim();
    return this.isValidTaskText(text) ? text : null;
  }

  private isValidTaskText(text: string): boolean {
    // Validate that the text is not empty after trimming whitespace
    // This prevents adding tasks with only spaces, tabs, or newlines
    return (
      text.length >= VALIDATION_RULES.MIN_TASK_LENGTH &&
      text.length <= VALIDATION_RULES.MAX_TASK_LENGTH
    );
  }

  private clearInput(): void {
    this.taskInput.value = "";
  }

  private addTaskToDOM(task: Task): void {
    const taskElement = this.createTaskElement(task);
    this.taskList.appendChild(taskElement);
  }

  private async loadInitialTasks(): Promise<void> {
    try {
      const tasks = await this.taskService.getTasks();
      this.renderTaskList(tasks);
    } catch (error) {
      this.handleTaskError("Failed to load initial tasks", error);
    }
  }

  private renderTaskList(tasks: Task[]): void {
    // Clear existing tasks first
    this.taskList.innerHTML = "";
    // Add all tasks to DOM
    tasks.forEach((task) => this.addTaskToDOM(task));

    // Update UI state
    this.updateEmptyState(tasks.length === 0);
    this.updateStats(tasks);
  }

  private updateEmptyState(isEmpty: boolean): void {
    const emptyState = document.getElementById("empty-state");
    if (emptyState) {
      emptyState.style.display = isEmpty ? "block" : "none";
    }
  }

  private updateStats(tasks: Task[]): void {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const statsText = document.getElementById("stats-text");

    if (statsText) {
      statsText.textContent = `${total} 個中 ${completed} 個完了`;
    }
  }

  private async refreshUI(): Promise<void> {
    try {
      const tasks = await this.taskService.getTasks();
      this.updateEmptyState(tasks.length === 0);
      this.updateStats(tasks);
    } catch (error) {
      this.handleTaskError("Failed to refresh UI", error);
    }
  }

  private handleTaskError(message: string, error: unknown): void {
    console.error(message, error);
    // In a real app, we might show an error message to the user
    // For now, we just log the error to prevent the app from breaking
  }

  private createTaskElement(task: Task): HTMLLIElement {
    const taskItem = document.createElement("li");
    taskItem.className = task.completed ? "task-item completed" : "task-item";
    taskItem.setAttribute("data-task-id", task.id);
    taskItem.setAttribute("role", "listitem");

    taskItem.innerHTML = this.getTaskHTML(task);
    return taskItem;
  }

  private getTaskHTML(task: Task): string {
    // Escape HTML to prevent XSS
    const escapedText = this.escapeHtml(task.text);

    return `
      <div class="task-content">
        <input 
          type="checkbox" 
          id="task-checkbox-${task.id}" 
          class="task-checkbox"
          aria-describedby="task-text-${task.id}"
          ${task.completed ? "checked" : ""}
        />
        <label for="task-checkbox-${task.id}" class="task-label">
          <span id="task-text-${
            task.id
          }" class="task-text">${escapedText}</span>
        </label>
        <button 
          type="button" 
          class="delete-btn" 
          aria-label="タスク「${escapedText}」を削除"
          data-task-id="${task.id}"
        >
          ×
        </button>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
