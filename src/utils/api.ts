// API utility for managing requests with abort capability
import { supabase } from '../lib/supabaseClient';

class ApiManager {
  private static instance: ApiManager;
  private abortControllers: Map<string, AbortController> = new Map();

  private constructor() {}

  static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager();
    }
    return ApiManager.instance;
  }

  // Create a new abort controller for a request
  createAbortController(key: string): AbortController {
    // Cancel any existing request with the same key
    this.cancelRequest(key);
    
    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller;
  }

  // Cancel a specific request
  cancelRequest(key: string): void {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
  }

  // Cancel all pending requests
  cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  // Clean up completed requests
  cleanupRequest(key: string): void {
    this.abortControllers.delete(key);
  }

  // Make a cancellable request
  async makeRequest<T>(
    key: string,
    requestFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T> {
    const controller = this.createAbortController(key);
    
    try {
      const result = await requestFn(controller.signal);
      this.cleanupRequest(key);
      return result;
    } catch (error: any) {
      this.cleanupRequest(key);
      
      // Don't throw error if request was aborted
      if (error.name === 'AbortError') {
        console.log(`Request ${key} was cancelled`);
        throw new Error('Request cancelled');
      }
      
      throw error;
    }
  }
}

export const apiManager = ApiManager.getInstance();

// Enhanced fetch functions with abort capability
export const fetchWithAbort = async (
  table: string,
  query: any = {},
  requestKey?: string
): Promise<any> => {
  const key = requestKey || `fetch-${table}-${Date.now()}`;
  
  return apiManager.makeRequest(key, async (signal) => {
    // Note: Supabase doesn't directly support AbortSignal,
    // but we can still use it to track and cancel our logic
    if (signal.aborted) {
      throw new Error('Request aborted');
    }
    
    let request = supabase.from(table).select(query.select || '*');
    
    if (query.filter) {
      Object.entries(query.filter).forEach(([field, value]) => {
        request = request.eq(field, value);
      });
    }
    
    const { data, error } = await request;
    
    if (signal.aborted) {
      throw new Error('Request aborted');
    }
    
    if (error) throw error;
    return data;
  });
};

// Export function to cancel all requests (used during logout)
export const cancelAllApiRequests = () => {
  apiManager.cancelAllRequests();
};
