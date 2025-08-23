import './style.css';
import { UIController } from './controllers/UIController.js';
import { TaskService } from './services/TaskService.js';
import { LocalStorageTaskRepository } from './repositories/LocalStorageTaskRepository.js';

/**
 * Application configuration interface
 */
interface AppConfig {
  enableLogging?: boolean;
  errorDisplayDuration?: number;
}

/**
 * Default application configuration
 */
const DEFAULT_CONFIG: AppConfig = {
  enableLogging: true,
  errorDisplayDuration: 5000,
};

/**
 * Application class responsible for initializing and managing the todo app
 * Follows dependency injection pattern for better testability and maintainability
 */
export class App {
  private uiController: UIController | null = null;
  private taskService: TaskService | null = null;
  private repository: LocalStorageTaskRepository | null = null;
  private isInitialized = false;
  private config: AppConfig;

  constructor(config: AppConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the application with dependency injection
   * Sets up the complete dependency chain: Repository -> Service -> UI Controller
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      this.log('Application is already initialized', 'warn');
      return;
    }

    try {
      this.log('Starting application initialization...');

      // Validate DOM requirements before initialization
      this.validateDOMRequirements();

      // Initialize data layer
      this.repository = new LocalStorageTaskRepository();
      this.log('Repository initialized');

      // Initialize service layer
      this.taskService = new TaskService(this.repository);
      this.log('Task service initialized');

      // Initialize presentation layer
      this.uiController = new UIController();
      this.log('UI controller initialized');

      this.isInitialized = true;
      this.log('Application initialized successfully');
    } catch (error) {
      this.log(`Failed to initialize application: ${error}`, 'error');
      this.showInitializationError();
      throw error;
    }
  }

  /**
   * Validate that required DOM elements exist
   */
  private validateDOMRequirements(): void {
    const requiredElements = [
      'task-list',
      'add-task-form',
      'new-task-input',
      'error-message',
    ];

    const missingElements = requiredElements.filter(
      id => !document.getElementById(id)
    );

    if (missingElements.length > 0) {
      throw new Error(
        `Missing required DOM elements: ${missingElements.join(', ')}`
      );
    }
  }

  /**
   * Reset the application state (useful for testing)
   */
  reset(): void {
    this.uiController = null;
    this.taskService = null;
    this.repository = null;
    this.isInitialized = false;
    this.log('Application state reset');
  }

  /**
   * Show initialization error to user
   */
  private showInitializationError(): void {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent =
        'アプリケーションの初期化に失敗しました。ページを再読み込みしてください。';
      errorElement.style.display = 'block';

      // Auto-hide error after configured duration
      if (
        this.config.errorDisplayDuration &&
        this.config.errorDisplayDuration > 0
      ) {
        setTimeout(() => {
          errorElement.style.display = 'none';
        }, this.config.errorDisplayDuration);
      }
    }
  }

  /**
   * Logging utility with configurable levels
   */
  private log(message: string, level: 'log' | 'warn' | 'error' = 'log'): void {
    if (this.config.enableLogging) {
      console[level](`[TodoApp] ${message}`);
    }
  }

  /**
   * Get the UI controller instance
   */
  getUIController(): UIController | null {
    return this.uiController;
  }

  /**
   * Get the task service instance
   */
  getTaskService(): TaskService | null {
    return this.taskService;
  }

  /**
   * Get the repository instance
   */
  getRepository(): LocalStorageTaskRepository | null {
    return this.repository;
  }

  /**
   * Check if the application is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current configuration
   */
  getConfig(): AppConfig {
    return { ...this.config };
  }
}

/**
 * Application bootstrap function
 * Creates and initializes the application when DOM is ready
 */
async function bootstrap(): Promise<App> {
  const app = new App();

  try {
    await app.init();
    return app;
  } catch (error) {
    console.error('Application startup failed:', error);
    throw error;
  }
}

/**
 * Main entry point - initialize the application when DOM is ready
 */
function main(): void {
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await bootstrap();
    } catch (error) {
      // Error is already logged in bootstrap, just ensure it doesn't crash the page
      console.error('Failed to start application:', error);
    }
  });
}

// Start the application
main();

// Export for testing
export { bootstrap, main };
