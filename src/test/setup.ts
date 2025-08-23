import '@testing-library/jest-dom';

// Add CSS styles for testing
const style = document.createElement('style');
style.textContent = `
  .task-item.completed .task-text {
    text-decoration: line-through;
    color: #6c757d;
    opacity: 0.7;
  }
`;
document.head.appendChild(style);
