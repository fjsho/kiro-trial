import { describe, it, expect, beforeEach } from 'vitest';
import { UIController } from '../controllers/UIController';

describe('UIController - Edit Blur Unit Tests', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Setup DOM
    document.body.innerHTML = `
      <div id="app">
        <form id="add-task-form">
          <input id="new-task-input" type="text" placeholder="What needs to be done?" />
          <button type="submit">Add</button>
        </form>
        <div id="filter-buttons">
          <button class="filter-btn" data-filter="all">All</button>
          <button class="filter-btn" data-filter="active">Active</button>
          <button class="filter-btn" data-filter="completed">Completed</button>
        </div>
        <ul id="task-list"></ul>
        <div id="stats-text">0 個中 0 個完了</div>
        <div id="empty-state" style="display: none;">No tasks</div>
        <div id="error-message" style="display: none;"></div>
      </div>
    `;

    new UIController();
  });

  it('should add blur event listener when creating edit input', () => {
    // Create a mock task element
    const taskList = document.getElementById('task-list') as HTMLElement;
    const taskElement = document.createElement('li');
    taskElement.className = 'task-item';
    taskElement.setAttribute('data-task-id', 'test-id');
    taskElement.innerHTML = `
      <div class="task-content">
        <input type="checkbox" class="task-checkbox" />
        <label class="task-label">
          <span class="task-text">Test task</span>
        </label>
        <button type="button" class="delete-btn">×</button>
      </div>
    `;
    taskList.appendChild(taskElement);

    const taskText = taskElement.querySelector('.task-text') as HTMLElement;

    // Simulate double-click to trigger edit mode
    const dblClickEvent = new MouseEvent('dblclick', { bubbles: true });
    taskText.dispatchEvent(dblClickEvent);

    // Check if edit input was created
    const editInput = taskElement.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();
    expect(editInput.getAttribute('data-task-id')).toBe('test-id');
    expect(editInput.value).toBe('Test task');
  });

  it('should handle blur event on edit input with valid text', async () => {
    // Add a task first through the form
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    const taskForm = document.getElementById(
      'add-task-form'
    ) as HTMLFormElement;

    taskInput.value = 'Original task';
    const submitEvent = new Event('submit');
    taskForm.dispatchEvent(submitEvent);

    // Wait for task to be added
    await new Promise(resolve => setTimeout(resolve, 0));

    // Find the created task element
    const taskElement = document.querySelector('.task-item') as HTMLElement;
    expect(taskElement).toBeTruthy();

    const taskText = taskElement.querySelector('.task-text') as HTMLElement;

    // Enter edit mode
    const dblClickEvent = new MouseEvent('dblclick', { bubbles: true });
    taskText.dispatchEvent(dblClickEvent);

    const editInput = taskElement.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();

    // Change the text
    editInput.value = 'Updated task via blur';

    // Simulate blur event
    const blurEvent = new FocusEvent('blur', { bubbles: true });
    editInput.dispatchEvent(blurEvent);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify edit mode is exited and text is updated
    const remainingEditInput = taskElement.querySelector('.task-edit-input');
    expect(remainingEditInput).toBeNull();
    expect(taskText.style.display).not.toBe('none');
    expect(taskText.textContent).toBe('Updated task via blur');
  });

  it('should handle blur event on edit input with empty text (cancel edit)', async () => {
    // Add a task first through the form
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    const taskForm = document.getElementById(
      'add-task-form'
    ) as HTMLFormElement;

    taskInput.value = 'Original task';
    const submitEvent = new Event('submit');
    taskForm.dispatchEvent(submitEvent);

    // Wait for task to be added
    await new Promise(resolve => setTimeout(resolve, 0));

    // Find the created task element
    const taskElement = document.querySelector('.task-item') as HTMLElement;
    const taskText = taskElement.querySelector('.task-text') as HTMLElement;
    const originalText = taskText.textContent;

    // Enter edit mode
    const dblClickEvent = new MouseEvent('dblclick', { bubbles: true });
    taskText.dispatchEvent(dblClickEvent);

    const editInput = taskElement.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();

    // Clear the text (empty)
    editInput.value = '';

    // Simulate blur event
    const blurEvent = new FocusEvent('blur', { bubbles: true });
    editInput.dispatchEvent(blurEvent);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify edit mode is exited and original text is preserved
    const remainingEditInput = taskElement.querySelector('.task-edit-input');
    expect(remainingEditInput).toBeNull();
    expect(taskText.style.display).not.toBe('none');
    expect(taskText.textContent).toBe(originalText);
  });

  it('should handle blur event on edit input with whitespace-only text (cancel edit)', async () => {
    // Add a task first through the form
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    const taskForm = document.getElementById(
      'add-task-form'
    ) as HTMLFormElement;

    taskInput.value = 'Original task';
    const submitEvent = new Event('submit');
    taskForm.dispatchEvent(submitEvent);

    // Wait for task to be added
    await new Promise(resolve => setTimeout(resolve, 0));

    // Find the created task element
    const taskElement = document.querySelector('.task-item') as HTMLElement;
    const taskText = taskElement.querySelector('.task-text') as HTMLElement;
    const originalText = taskText.textContent;

    // Enter edit mode
    const dblClickEvent = new MouseEvent('dblclick', { bubbles: true });
    taskText.dispatchEvent(dblClickEvent);

    const editInput = taskElement.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();

    // Set whitespace-only text
    editInput.value = '   \t\n   ';

    // Simulate blur event
    const blurEvent = new FocusEvent('blur', { bubbles: true });
    editInput.dispatchEvent(blurEvent);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify edit mode is exited and original text is preserved
    const remainingEditInput = taskElement.querySelector('.task-edit-input');
    expect(remainingEditInput).toBeNull();
    expect(taskText.style.display).not.toBe('none');
    expect(taskText.textContent).toBe(originalText);
  });
});
