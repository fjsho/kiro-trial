import type { Task } from "../models/Task.js";
import { TaskService, type FilterType } from "../services/TaskService.js";
import { LocalStorageTaskRepository } from "../repositories/LocalStorageTaskRepository.js";

// Constants for validation
const VALIDATION_RULES = {
  MIN_TASK_LENGTH: 1,
  MAX_TASK_LENGTH: 500,
} as const;

// Constants for error handling
const ERROR_DISPLAY_DURATION = 5000; // 5 seconds

// Error message constants
const ERROR_MESSAGES = {
  QUOTA_EXCEEDED:
    "ストレージの容量が不足しています。不要なデータを削除してください。",
  SAVE_FAILED:
    "保存に失敗しました。しばらく時間をおいてから再度お試しください。",
  LOAD_FAILED:
    "データの読み込みに失敗しました。ページを再読み込みしてください。",
  UPDATE_FAILED: "タスクの更新に失敗しました。再度お試しください。",
  DELETE_FAILED: "タスクの削除に失敗しました。再度お試しください。",
  GENERIC_ERROR:
    "操作に失敗しました。しばらく時間をおいてから再度お試しください。",
} as const;

// Error element ID constant
const ERROR_ELEMENT_ID = "error-message";

export class UIController {
  private taskList!: HTMLElement;
  private taskForm!: HTMLFormElement;
  private taskInput!: HTMLInputElement;
  private taskService: TaskService;
  private currentFilter: FilterType = "all";
  private editingTaskId: string | null = null;
  private errorTimeoutId: number | null = null;

  // Cached DOM elements for performance
  private emptyStateElement: HTMLElement | null = null;
  private statsTextElement: HTMLElement | null = null;

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
    this.taskList.addEventListener("change", this.handleTaskToggle.bind(this));
    this.taskList.addEventListener("click", this.handleTaskDelete.bind(this));
    this.taskList.addEventListener("dblclick", this.handleTaskEdit.bind(this));

    // Bind filter button events
    this.bindFilterEvents();
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

  private async handleTaskToggle(event: Event): Promise<void> {
    const checkbox = event.target as HTMLInputElement;

    if (!this.isTaskCheckbox(checkbox)) {
      return;
    }

    const taskItem = this.getTaskItemFromCheckbox(checkbox);
    const taskId = this.getTaskIdFromElement(taskItem);

    if (!taskId) {
      return;
    }

    try {
      await this.taskService.toggleTask(taskId);
      this.updateTaskItemCompletionState(taskItem, checkbox.checked);
      await this.refreshUI();
    } catch (error) {
      this.handleTaskError("Failed to toggle task", error);
      this.revertCheckboxState(checkbox);
    }
  }

  private async handleTaskDelete(event: Event): Promise<void> {
    const deleteButton = event.target as HTMLButtonElement;

    if (!this.isDeleteButton(deleteButton)) {
      return;
    }

    const taskId = this.getTaskIdFromDeleteButton(deleteButton);

    if (!taskId) {
      console.warn("Delete button clicked but no task ID found");
      return;
    }

    try {
      await this.taskService.deleteTask(taskId);
      await this.refreshTaskList();
    } catch (error) {
      this.handleTaskError("Failed to delete task", error);
    }
  }

  /**
   * Handles double-click events on task elements to enter edit mode
   * Only responds to double-clicks on task text elements
   * Prevents entering edit mode if another task is already being edited
   *
   * @param event - The double-click event
   */
  private handleTaskEdit(event: Event): void {
    const target = event.target as HTMLElement;

    // Check if the double-click was on a task text element
    if (!this.isTaskTextElement(target)) {
      return;
    }

    const taskItem = this.getTaskItemFromElement(target);
    if (!taskItem) {
      return;
    }

    const taskId = this.getTaskIdFromElement(taskItem);
    if (!taskId) {
      return;
    }

    // Prevent multiple edit modes
    if (this.editingTaskId) {
      return;
    }

    this.enterEditMode(taskItem, target, taskId);
  }

  private isTaskTextElement(element: HTMLElement): boolean {
    return element.classList.contains("task-text");
  }

  private getTaskItemFromElement(element: HTMLElement): HTMLElement | null {
    return element.closest(".task-item") as HTMLElement;
  }

  /**
   * Enters edit mode for a specific task
   * Creates an edit input field, hides the original text, and sets focus
   *
   * @param taskItem - The task item HTML element
   * @param taskTextElement - The task text HTML element to be edited
   * @param taskId - The unique identifier of the task
   */
  private enterEditMode(
    taskItem: HTMLElement,
    taskTextElement: HTMLElement,
    taskId: string
  ): void {
    // Set editing state
    this.editingTaskId = taskId;

    // Get current task text
    const currentText = taskTextElement.textContent || "";

    // Create edit input with proper attributes
    const editInput = this.createEditInput(currentText, taskId);

    // Hide the original task text
    taskTextElement.style.display = "none";

    // Insert the edit input after the task text
    taskTextElement.parentNode?.insertBefore(
      editInput,
      taskTextElement.nextSibling
    );

    // Focus the edit input and select all text for easy editing
    editInput.focus();
    editInput.select();
  }

  private createEditInput(
    currentText: string,
    taskId: string
  ): HTMLInputElement {
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "task-edit-input";
    editInput.value = currentText;
    editInput.setAttribute("data-task-id", taskId);
    editInput.setAttribute("aria-label", "タスクを編集");

    // Add event listeners for Enter and Escape keys
    editInput.addEventListener("keydown", this.handleEditKeyDown.bind(this));

    // Add blur event listener to save on focus loss
    editInput.addEventListener("blur", this.handleEditBlur.bind(this));

    return editInput;
  }

  /**
   * Handles keydown events in edit mode (Enter to save, Escape to cancel)
   */
  private async handleEditKeyDown(event: KeyboardEvent): Promise<void> {
    if (event.key === "Enter") {
      event.preventDefault();
      await this.saveEditedTask(event.target as HTMLInputElement);
    } else if (event.key === "Escape") {
      event.preventDefault();
      this.cancelEdit();
    }
  }

  /**
   * Handles blur events in edit mode (save on focus loss)
   */
  private async handleEditBlur(event: FocusEvent): Promise<void> {
    await this.saveEditedTask(event.target as HTMLInputElement);
  }

  /**
   * Saves the edited task content and exits edit mode
   */
  private async saveEditedTask(editInput: HTMLInputElement): Promise<void> {
    const newText = editInput.value.trim();
    const taskId = editInput.getAttribute("data-task-id");

    if (!taskId) {
      console.warn("No task ID found for edit input");
      this.exitEditMode();
      return;
    }

    // If text is empty, cancel the edit instead of saving
    if (!newText) {
      this.cancelEdit();
      return;
    }

    try {
      // Update the task through the service
      await this.taskService.updateTask(taskId, { text: newText });

      // Update the UI
      const taskItem = document.querySelector(
        `[data-task-id="${taskId}"]`
      ) as HTMLElement;
      if (taskItem) {
        const taskText = taskItem.querySelector(".task-text") as HTMLElement;
        if (taskText) {
          taskText.textContent = newText;
        }
      }

      // Exit edit mode
      this.exitEditMode();
    } catch (error) {
      this.handleTaskError("Failed to update task", error);
      this.exitEditMode();
    }
  }

  /**
   * Cancels the edit and exits edit mode without saving changes
   */
  private cancelEdit(): void {
    this.exitEditMode();
  }

  /**
   * Exits edit mode for the currently editing task
   */
  private exitEditMode(): void {
    if (!this.editingTaskId) {
      return;
    }

    // Find the task item being edited
    const taskItem = document.querySelector(
      `[data-task-id="${this.editingTaskId}"]`
    ) as HTMLElement;
    if (!taskItem) {
      this.editingTaskId = null;
      return;
    }

    // Remove edit input
    const editInput = taskItem.querySelector(".task-edit-input");
    if (editInput) {
      editInput.remove();
    }

    // Show original task text
    const taskText = taskItem.querySelector(".task-text") as HTMLElement;
    if (taskText) {
      taskText.style.display = "";
    }

    // Clear editing state
    this.editingTaskId = null;
  }

  private isTaskCheckbox(element: HTMLInputElement): boolean {
    return element.classList.contains("task-checkbox");
  }

  private isDeleteButton(element: HTMLButtonElement): boolean {
    return element.classList.contains("delete-btn");
  }

  private getTaskIdFromDeleteButton(
    deleteButton: HTMLButtonElement
  ): string | null {
    return deleteButton.getAttribute("data-task-id");
  }

  private getTaskItemFromCheckbox(checkbox: HTMLInputElement): HTMLElement {
    const taskItem = checkbox.closest(".task-item") as HTMLElement;
    if (!taskItem) {
      throw new Error("Task item not found for checkbox");
    }
    return taskItem;
  }

  private getTaskIdFromElement(element: HTMLElement): string | null {
    return element.getAttribute("data-task-id");
  }

  /**
   * Updates the visual completion state of a task item by adding or removing the 'completed' CSS class.
   * This triggers the strikethrough styling for completed tasks.
   *
   * @param taskItem - The HTML element representing the task item
   * @param completed - Whether the task should be marked as completed
   */
  private updateTaskItemCompletionState(
    taskItem: HTMLElement,
    completed: boolean
  ): void {
    if (completed) {
      taskItem.classList.add("completed");
    } else {
      taskItem.classList.remove("completed");
    }
  }

  private revertCheckboxState(checkbox: HTMLInputElement): void {
    checkbox.checked = !checkbox.checked;
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

  /**
   * Renders filtered task list without updating stats (stats should show all tasks)
   * @param tasks - The filtered tasks to render
   */
  private renderFilteredTaskList(tasks: Task[]): void {
    // Clear existing tasks first
    this.taskList.innerHTML = "";
    // Add filtered tasks to DOM
    tasks.forEach((task) => this.addTaskToDOM(task));

    // Update empty state based on filtered tasks
    this.updateEmptyState(tasks.length === 0);

    // Update stats with all tasks (not just filtered)
    this.updateStatsWithAllTasks();
  }

  private updateEmptyState(isEmpty: boolean): void {
    // Cache the empty state element to avoid repeated DOM queries
    if (!this.emptyStateElement) {
      this.emptyStateElement = document.getElementById("empty-state");
    }
    if (this.emptyStateElement) {
      this.emptyStateElement.style.display = isEmpty ? "block" : "none";
    }
  }

  private updateStats(tasks: Task[]): void {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;

    // Cache the stats element to avoid repeated DOM queries
    if (!this.statsTextElement) {
      this.statsTextElement = document.getElementById("stats-text");
    }

    if (this.statsTextElement) {
      this.statsTextElement.textContent = `${total} 個中 ${completed} 個完了`;
    }
  }

  /**
   * Updates stats with all tasks (used when filtering)
   */
  private async updateStatsWithAllTasks(): Promise<void> {
    try {
      const allTasks = await this.taskService.getTasks();
      this.updateStats(allTasks);
    } catch (error) {
      this.handleTaskError("Failed to update stats", error);
    }
  }

  private async refreshUI(): Promise<void> {
    try {
      // Only update stats and empty state, don't change the current filter view
      await this.updateStatsWithAllTasks();

      // Update empty state based on current displayed tasks
      const displayedTasks = document.querySelectorAll("#task-list .task-item");
      this.updateEmptyState(displayedTasks.length === 0);
    } catch (error) {
      this.handleTaskError("Failed to refresh UI", error);
    }
  }

  private async refreshTaskList(): Promise<void> {
    try {
      // If we're currently filtering, maintain the filter
      if (this.currentFilter !== "all") {
        await this.handleFilterChange(this.currentFilter);
      } else {
        // Otherwise, show all tasks
        const tasks = await this.taskService.getTasks();
        this.renderTaskList(tasks);
      }
    } catch (error) {
      this.handleTaskError("Failed to refresh task list", error);
    }
  }

  private handleTaskError(message: string, error: unknown): void {
    console.error(message, error);
    this.showErrorMessage(message, error);
  }

  /**
   * エラーメッセージを表示する
   *
   * エラーメッセージ要素にメッセージを表示し、指定時間後に自動的に非表示にします。
   * 複数のエラーが連続で発生した場合は、前のタイマーをクリアして新しいメッセージを表示します。
   *
   * @param message - 表示するメッセージ（エラーの文脈情報）
   * @param error - エラーオブジェクト（Error インスタンスまたは任意の値）
   */
  private showErrorMessage(message: string, error: unknown): void {
    const errorElement = document.getElementById(ERROR_ELEMENT_ID);
    if (!errorElement) {
      console.warn("Error message element not found");
      return;
    }

    // エラーの種類に応じてメッセージを決定
    const displayMessage = this.getErrorDisplayMessage(message, error);

    // エラーメッセージを表示
    errorElement.textContent = displayMessage;
    errorElement.style.display = "block";

    // 既存のタイマーをクリア（複数のエラーが連続で発生した場合）
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }

    // 指定時間後に自動的に非表示にする
    this.errorTimeoutId = setTimeout(() => {
      errorElement.style.display = "none";
      this.errorTimeoutId = null;
    }, ERROR_DISPLAY_DURATION);
  }

  /**
   * エラーの種類に応じて適切な表示メッセージを取得する
   *
   * LocalStorage関連のエラー、CRUD操作のエラーなどを判定し、
   * ユーザーにとって分かりやすいメッセージを返します。
   *
   * @param message - 基本メッセージ（エラーの文脈情報）
   * @param error - エラーオブジェクト（Error インスタンスまたは任意の値）
   * @returns ユーザー向けの表示用メッセージ
   */
  private getErrorDisplayMessage(message: string, error: unknown): string {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // QuotaExceededError を最初にチェック（より具体的なエラー）
    if (
      errorMessage.includes("QuotaExceededError") ||
      (error instanceof Error && error.name === "QuotaExceededError")
    ) {
      return ERROR_MESSAGES.QUOTA_EXCEEDED;
    }

    // 読み込みエラーをチェック
    if (
      errorMessage.includes("Failed to load tasks from localStorage") ||
      message.includes("Failed to load initial tasks")
    ) {
      return ERROR_MESSAGES.LOAD_FAILED;
    }

    // 保存エラーをチェック（QuotaExceededError以外の保存エラー）
    if (
      errorMessage.includes("Failed to save tasks to localStorage") ||
      errorMessage.includes("Failed to add task")
    ) {
      return ERROR_MESSAGES.SAVE_FAILED;
    }

    if (errorMessage.includes("Failed to update task")) {
      return ERROR_MESSAGES.UPDATE_FAILED;
    }

    if (errorMessage.includes("Failed to delete task")) {
      return ERROR_MESSAGES.DELETE_FAILED;
    }

    // デフォルトメッセージ
    return ERROR_MESSAGES.GENERIC_ERROR;
  }

  /**
   * Binds click events to filter buttons
   */
  private bindFilterEvents(): void {
    const filterButtons =
      document.querySelectorAll<HTMLButtonElement>(".filter-btn");

    if (filterButtons.length === 0) {
      console.warn(
        "No filter buttons found. Filter functionality will not be available."
      );
      return;
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", this.handleFilterButtonClick.bind(this));
    });
  }

  /**
   * Handles filter button click events
   * @param event - The click event
   */
  private async handleFilterButtonClick(event: Event): Promise<void> {
    const button = event.target as HTMLButtonElement;

    if (!button || !button.hasAttribute("data-filter")) {
      console.warn(
        "Invalid filter button clicked - missing data-filter attribute"
      );
      return;
    }

    const filter = button.getAttribute("data-filter") as FilterType;

    if (!filter || !this.isValidFilter(filter)) {
      console.warn(`Invalid filter button clicked: ${filter}`);
      return;
    }

    try {
      await this.handleFilterChange(filter);
    } catch (error) {
      this.handleTaskError("Failed to handle filter change", error);
    }
  }

  /**
   * Handles filter change events and updates the UI to show filtered tasks
   * @param filter - The filter type to apply ('all', 'active', 'completed')
   */
  async handleFilterChange(filter: FilterType): Promise<void> {
    if (!this.isValidFilter(filter)) {
      console.warn(`Invalid filter type: ${filter}`);
      return;
    }

    try {
      // Update current filter
      this.currentFilter = filter;

      // Get filtered tasks from the service
      const filteredTasks = await this.taskService.getFilteredTasks(filter);

      // Update the task list display
      this.renderFilteredTaskList(filteredTasks);

      // Update filter button states
      this.updateFilterButtonStates(filter);
    } catch (error) {
      this.handleTaskError("Failed to apply filter", error);
    }
  }

  /**
   * Validates if the provided filter is a valid FilterType
   * @param filter - The filter to validate
   * @returns true if valid, false otherwise
   */
  private isValidFilter(filter: string): filter is FilterType {
    return ["all", "active", "completed"].includes(filter);
  }

  /**
   * Updates the visual state of filter buttons by adding/removing the 'active' CSS class
   * and setting the appropriate aria-pressed attribute for accessibility.
   *
   * @param activeFilter - The currently active filter type
   */
  private updateFilterButtonStates(activeFilter: FilterType): void {
    // Get current filter buttons (don't cache here as buttons might be added dynamically in tests)
    const filterButtons =
      document.querySelectorAll<HTMLButtonElement>(".filter-btn");

    filterButtons.forEach((button) => {
      const buttonFilter = button.getAttribute(
        "data-filter"
      ) as FilterType | null;
      const isActive = buttonFilter === activeFilter;

      // Update visual state
      button.classList.toggle("active", isActive);

      // Update accessibility state - always set aria-pressed, even for buttons without data-filter
      button.setAttribute("aria-pressed", isActive.toString());
    });
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
