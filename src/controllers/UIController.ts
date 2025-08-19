import { generateTaskId } from "../utils/idGenerator.js";

// Constants for validation
const VALIDATION_RULES = {
  MIN_TASK_LENGTH: 1,
  MAX_TASK_LENGTH: 500,
} as const;

export class UIController {
  private taskList!: HTMLElement;
  private taskForm!: HTMLFormElement;
  private taskInput!: HTMLInputElement;

  constructor() {
    this.initializeElements();
    this.bindEvents();
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

  private processTaskAddition(): void {
    const validatedText = this.getValidatedTaskText();

    if (validatedText !== null) {
      this.addTaskToDOM(validatedText);
      this.clearInput();
    }
    // If validation fails, input field is not cleared to allow user to fix the input
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

  private addTaskToDOM(text: string): void {
    const taskId = this.generateTaskId();
    const taskElement = this.createTaskElement(taskId, text);
    this.taskList.appendChild(taskElement);
  }

  private generateTaskId(): string {
    return generateTaskId();
  }

  private createTaskElement(taskId: string, text: string): HTMLLIElement {
    const taskItem = document.createElement("li");
    taskItem.className = "task-item";
    taskItem.setAttribute("data-task-id", taskId);
    taskItem.setAttribute("role", "listitem");

    taskItem.innerHTML = this.getTaskHTML(taskId, text);
    return taskItem;
  }

  private getTaskHTML(taskId: string, text: string): string {
    // Escape HTML to prevent XSS
    const escapedText = this.escapeHtml(text);

    return `
      <div class="task-content">
        <input 
          type="checkbox" 
          id="task-checkbox-${taskId}" 
          class="task-checkbox"
          aria-describedby="task-text-${taskId}"
        />
        <label for="task-checkbox-${taskId}" class="task-label">
          <span id="task-text-${taskId}" class="task-text">${escapedText}</span>
        </label>
        <button 
          type="button" 
          class="delete-btn" 
          aria-label="タスク「${escapedText}」を削除"
          data-task-id="${taskId}"
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
