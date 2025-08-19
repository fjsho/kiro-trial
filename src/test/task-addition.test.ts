import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/dom'
import { UIController } from '../controllers/UIController.js'

describe('Task Addition E2E', () => {
  beforeEach(() => {
    // Set up DOM with the HTML structure
    document.body.innerHTML = `
      <div id="app">
        <main class="app-main">
          <section class="input-section">
            <form id="add-task-form" class="add-task-form">
              <input 
                type="text" 
                id="new-task-input" 
                class="new-task-input"
                placeholder="新しいタスクを入力..."
                maxlength="500"
                required
              />
              <button type="submit" id="add-task-btn" class="add-task-btn">
                追加
              </button>
            </form>
          </section>
          <section class="task-list-section">
            <ul id="task-list" class="task-list" role="list">
              <!-- Tasks will be added here -->
            </ul>
          </section>
        </main>
      </div>
    `
    
    // Initialize the UIController
    new UIController();
  })

  it('should add a new task when user enters text and clicks add button', async () => {
    // Arrange
    const taskInput = screen.getByRole('textbox') as HTMLInputElement
    const form = document.getElementById('add-task-form') as HTMLFormElement
    const taskList = document.getElementById('task-list')!
    
    const taskText = 'テストタスク'
    
    // Act
    fireEvent.change(taskInput, { target: { value: taskText } })
    fireEvent.submit(form)
    
    // Assert
    const taskItems = taskList.querySelectorAll('.task-item')
    expect(taskItems).toHaveLength(1)
    
    const addedTask = taskItems[0]
    const taskTextElement = addedTask.querySelector('.task-text')
    expect(taskTextElement).toHaveTextContent(taskText)
    
    // Verify the task has proper structure
    const checkbox = addedTask.querySelector('.task-checkbox') as HTMLInputElement
    expect(checkbox).toBeTruthy()
    expect(checkbox.checked).toBe(false)
    
    const deleteButton = addedTask.querySelector('.delete-btn')
    expect(deleteButton).toBeTruthy()
  })
})