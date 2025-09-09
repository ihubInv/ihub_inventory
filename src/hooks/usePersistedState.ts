import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state to localStorage
 * Automatically saves and restores state when component mounts/unmounts
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    storage?: Storage;
  } = {}
): [T, (value: T | ((prev: T) => T)) => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    storage = localStorage
  } = options;

  const [state, setState] = useState<T>(() => {
    try {
      const item = storage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      storage.setItem(key, serialize(state));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state, serialize, storage]);

  return [state, setState];
}

/**
 * Hook for persisting form state with debouncing
 * Prevents excessive localStorage writes during rapid typing
 */
export function usePersistedFormState<T>(
  key: string,
  defaultValue: T,
  debounceMs: number = 500
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Clear the persisted state when the component mounts to ensure a fresh form on full page refresh
  useEffect(() => {
    localStorage.removeItem(key);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [key, state, debounceMs]);

  return [state, setState];
}

/**
 * Hook for session-based state persistence
 * Data persists only for the current browser session
 */
export function useSessionState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  return usePersistedState(key, defaultValue, { storage: sessionStorage });
}
