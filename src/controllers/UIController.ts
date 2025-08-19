import { generateTaskId } from '../utils/idGenerator.js';

export class UIController {
  private taskList!: HTMLElement;
  private taskForm!: HTMLFormElement;
  private taskInput!: HTMLInputElement;

  constructor() {
    this.initializeElements();
    this.bindEvents();
  }

  private initializeElements(): void {
    this.taskList = this.getRequiredElement('task-list');
    this.taskForm = this.getRequiredElement('add-task-form') as HTMLFormElement;
    this.taskInput = this.getRequiredElement('new-task-input') as HTMLInputElement;
  }

  private getRequiredElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Required element with id '${id}' not found`);
    }
    return element;
  }

  private bindEvents(): void {
    this.taskForm.addEventListener('submit', this.handleAddTask.bind(this));
  }

  private handleAddTask(event: Event): void {
    event.preventDefault();
    const text = this.taskInput.value.trim();
    
    if (this.isValidTaskText(text)) {
      this.addTaskToDOM(text);
      this.clearInput();
    }
  }

  private isValidTaskText(text: string): boolean {
    return text.length > 0;
  }

  private clearInput(): void {
    this.taskInput.value = '';
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
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.setAttribute('data-task-id', taskId);
    taskItem.setAttribute('role', 'listitem');

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
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}