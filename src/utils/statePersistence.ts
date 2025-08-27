/**
 * State Persistence Utilities
 * Provides comprehensive state management across tab switches and page reloads
 */

export interface PersistenceOptions {
  key: string;
  storage?: 'localStorage' | 'sessionStorage';
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  debounceMs?: number;
}

export class StatePersistence {
  private static instance: StatePersistence;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): StatePersistence {
    if (!StatePersistence.instance) {
      StatePersistence.instance = new StatePersistence();
    }
    return StatePersistence.instance;
  }

  /**
   * Save state to storage with debouncing
   */
  saveState<T>(options: PersistenceOptions, value: T): void {
    const { key, storage = 'localStorage', serialize = JSON.stringify, debounceMs = 300 } = options;
    
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      try {
        const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
        storageObj.setItem(key, serialize(value));
        this.debounceTimers.delete(key);
      } catch (error) {
        console.warn(`Error saving state for key "${key}":`, error);
      }
    }, debounceMs);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Load state from storage
   */
  loadState<T>(options: PersistenceOptions, defaultValue: T): T {
    const { key, storage = 'localStorage', deserialize = JSON.parse } = options;
    
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      const item = storageObj.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.warn(`Error loading state for key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Remove state from storage
   */
  removeState(key: string, storage: 'localStorage' | 'sessionStorage' = 'localStorage'): void {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      storageObj.removeItem(key);
    } catch (error) {
      console.warn(`Error removing state for key "${key}":`, error);
    }
  }

  /**
   * Clear all persisted state
   */
  clearAllState(): void {
    try {
      // Clear localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('form_') || key.startsWith('app_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage
      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('form_') || key.startsWith('app_'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      console.warn('Error clearing persisted state:', error);
    }
  }

  /**
   * Get all persisted state keys
   */
  getAllKeys(): { localStorage: string[]; sessionStorage: string[] } {
    const localStorageKeys: string[] = [];
    const sessionStorageKeys: string[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('form_') || key.startsWith('app_'))) {
          localStorageKeys.push(key);
        }
      }

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('form_') || key.startsWith('app_'))) {
          sessionStorageKeys.push(key);
        }
      }
    } catch (error) {
      console.warn('Error getting persisted state keys:', error);
    }

    return { localStorage: localStorageKeys, sessionStorage: sessionStorageKeys };
  }
}

// Export singleton instance
export const statePersistence = StatePersistence.getInstance();

/**
 * Utility functions for common use cases
 */
export const formStateUtils = {
  /**
   * Save form data with automatic key generation
   */
  saveFormData: (formName: string, data: any) => {
    statePersistence.saveState({
      key: `form_${formName}`,
      storage: 'localStorage',
      debounceMs: 500
    }, data);
  },

  /**
   * Load form data with automatic key generation
   */
  loadFormData: (formName: string, defaultValue: any = {}) => {
    return statePersistence.loadState({
      key: `form_${formName}`,
      storage: 'localStorage'
    }, defaultValue);
  },

  /**
   * Clear form data
   */
  clearFormData: (formName: string) => {
    statePersistence.removeState(`form_${formName}`);
  }
};

/**
 * Tab visibility and focus management
 */
export class TabStateManager {
  private static instance: TabStateManager;
  private listeners: Set<() => void> = new Set();
  private isVisible = true;

  static getInstance(): TabStateManager {
    if (!TabStateManager.instance) {
      TabStateManager.instance = new TabStateManager();
    }
    return TabStateManager.instance;
  }

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible) {
        this.notifyListeners();
      }
    });

    // Handle window focus/blur
    window.addEventListener('focus', () => {
      this.isVisible = true;
      this.notifyListeners();
    });

    window.addEventListener('blur', () => {
      this.isVisible = false;
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.notifyListeners();
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.warn('Error in tab state listener:', error);
      }
    });
  }

  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  isTabVisible(): boolean {
    return this.isVisible;
  }
}

export const tabStateManager = TabStateManager.getInstance();
