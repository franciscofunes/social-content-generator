// Enhanced error handling for Firebase operations
export interface FirebaseError {
  code: string;
  message: string;
  details?: any;
}

export class FirebaseErrorHandler {
  static handle(error: any): FirebaseError {
    console.error('Firebase operation failed:', error);
    
    // Common Firebase error codes
    const errorMap: Record<string, string> = {
      'permission-denied': 'You don\'t have permission to perform this action.',
      'unavailable': 'Firebase service is temporarily unavailable. Please try again.',
      'deadline-exceeded': 'Request timed out. Please check your connection.',
      'resource-exhausted': 'Firebase quota exceeded. Please try again later.',
      'unauthenticated': 'Authentication required. Please sign in.',
      'already-exists': 'This resource already exists.',
      'not-found': 'The requested resource was not found.',
      'invalid-argument': 'Invalid data provided. Please check your input.',
      'failed-precondition': 'Operation cannot be completed in current state.',
      'aborted': 'Operation was aborted due to a conflict.',
      'out-of-range': 'Operation was attempted beyond valid range.',
      'unimplemented': 'This operation is not implemented.',
      'internal': 'Internal server error occurred.',
      'data-loss': 'Unrecoverable data loss or corruption.',
    };

    const code = error?.code || 'unknown-error';
    const defaultMessage = 'An unexpected error occurred. Please try again.';
    const friendlyMessage = errorMap[code] || defaultMessage;

    return {
      code,
      message: friendlyMessage,
      details: error
    };
  }

  static isNetworkError(error: any): boolean {
    const networkErrorCodes = [
      'unavailable',
      'deadline-exceeded',
      'resource-exhausted'
    ];
    return networkErrorCodes.includes(error?.code);
  }

  static isRetryable(error: any): boolean {
    const retryableCodes = [
      'unavailable',
      'deadline-exceeded',
      'aborted',
      'internal'
    ];
    return retryableCodes.includes(error?.code);
  }

  static shouldShowToUser(error: any): boolean {
    const hiddenCodes = [
      'internal',
      'data-loss',
      'unimplemented'
    ];
    return !hiddenCodes.includes(error?.code);
  }
}

// Retry mechanism for Firebase operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (!FirebaseErrorHandler.isRetryable(error) || attempt === maxRetries) {
        throw error;
      }
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError;
}

// Connection state management
export class ConnectionManager {
  private static isOnline = true;
  private static listeners: Array<(online: boolean) => void> = [];

  static init() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners(true);
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners(false);
      });
    }
  }

  static getStatus(): boolean {
    return this.isOnline;
  }

  static onStatusChange(callback: (online: boolean) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private static notifyListeners(online: boolean) {
    this.listeners.forEach(listener => listener(online));
  }
}

// Offline cache for chat sessions (simple in-memory cache)
export class OfflineCache {
  private static cache = new Map<string, any>();
  
  static set(key: string, value: any, ttlMs: number = 5 * 60 * 1000) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }
  
  static get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  static clear() {
    this.cache.clear();
  }
  
  static has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    return Date.now() <= item.expiresAt;
  }
}