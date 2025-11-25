import type { UserPreferences, UserProfile, SearchHistoryEntry } from '../../types';

const DB_NAME = 'EventConciergeDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  USERS: 'users',
  PREFERENCES: 'preferences',
  SEARCH_HISTORY: 'searchHistory',
} as const;

/**
 * Singleton Database Service for IndexedDB
 * - Maintains a single shared connection instance
 * - All write operations wait for oncomplete event (not onsuccess)
 */
class DatabaseService {
  private static instance: DatabaseService | null = null;
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize and get the database connection
   * Returns a cached connection if already initialized
   */
  public async getConnection(): Promise<IDBDatabase> {
    // Return existing connection
    if (this.db) {
      return this.db;
    }

    // Return pending connection promise if initialization is in progress
    if (this.dbPromise) {
      return this.dbPromise;
    }

    // Initialize new connection
    this.dbPromise = this.initDatabase();
    this.db = await this.dbPromise;
    return this.db;
  }

  /**
   * Initialize the IndexedDB database
   */
  private initDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const db = request.result;
        
        // Handle connection close
        db.onclose = () => {
          this.db = null;
          this.dbPromise = null;
        };

        // Handle version change (another tab opened with newer version)
        db.onversionchange = () => {
          db.close();
          this.db = null;
          this.dbPromise = null;
        };

        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create users store
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          const usersStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
          usersStore.createIndex('isOnboarded', 'isOnboarded', { unique: false });
        }

        // Create preferences store
        if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
          const prefsStore = db.createObjectStore(STORES.PREFERENCES, { keyPath: 'id' });
          prefsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Create search history store
        if (!db.objectStoreNames.contains(STORES.SEARCH_HISTORY)) {
          const historyStore = db.createObjectStore(STORES.SEARCH_HISTORY, { keyPath: 'id' });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Execute a write operation and wait for oncomplete
   * This ensures data is fully committed to disk
   */
  private async executeWrite<T>(
    storeName: string,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.getConnection();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = operation(store);
      
      let result: T;

      request.onsuccess = () => {
        result = request.result;
      };

      request.onerror = () => {
        reject(request.error);
      };

      // Wait for transaction oncomplete, not request onsuccess
      transaction.oncomplete = () => {
        resolve(result);
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };

      transaction.onabort = () => {
        reject(new Error('Transaction aborted'));
      };
    });
  }

  /**
   * Execute a read operation
   */
  private async executeRead<T>(
    storeName: string,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.getConnection();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // ============================================
  // User Profile Operations
  // ============================================

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return this.executeRead(STORES.USERS, (store) => store.get(userId));
  }

  /**
   * Get the default user profile (for single-user MVP)
   */
  async getDefaultUserProfile(): Promise<UserProfile | undefined> {
    return this.getUserProfile('default-user');
  }

  /**
   * Save or update user profile
   * Waits for oncomplete to ensure data is persisted
   */
  async saveUserProfile(profile: UserProfile): Promise<IDBValidKey> {
    const profileWithTimestamp = {
      ...profile,
      updatedAt: new Date(),
    };
    return this.executeWrite(STORES.USERS, (store) => store.put(profileWithTimestamp));
  }

  /**
   * Create default user profile if it doesn't exist
   */
  async ensureDefaultUser(): Promise<UserProfile> {
    const existing = await this.getDefaultUserProfile();
    if (existing) {
      return existing;
    }

    const newProfile: UserProfile = {
      id: 'default-user',
      isOnboarded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveUserProfile(newProfile);
    return newProfile;
  }

  // ============================================
  // User Preferences Operations
  // ============================================

  /**
   * Get user preferences by ID
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return this.executeRead(STORES.PREFERENCES, (store) => store.get(userId));
  }

  /**
   * Get default user preferences
   */
  async getDefaultUserPreferences(): Promise<UserPreferences | undefined> {
    return this.getUserPreferences('default-user');
  }

  /**
   * Save or update user preferences
   * Waits for oncomplete to ensure data is persisted
   */
  async saveUserPreferences(preferences: UserPreferences): Promise<IDBValidKey> {
    const prefsWithTimestamp = {
      ...preferences,
      updatedAt: new Date(),
    };
    return this.executeWrite(STORES.PREFERENCES, (store) => store.put(prefsWithTimestamp));
  }

  /**
   * Create default preferences if they don't exist
   */
  async ensureDefaultPreferences(): Promise<UserPreferences> {
    const existing = await this.getDefaultUserPreferences();
    if (existing) {
      return existing;
    }

    const newPreferences: UserPreferences = {
      id: 'default-user',
      location: null,
      interests: [],
      budgetRange: { min: 0, max: 200 },
      groupSize: 'solo',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveUserPreferences(newPreferences);
    return newPreferences;
  }

  // ============================================
  // Search History Operations
  // ============================================

  /**
   * Add a search history entry
   */
  async addSearchHistory(entry: Omit<SearchHistoryEntry, 'id' | 'timestamp'>): Promise<IDBValidKey> {
    const fullEntry: SearchHistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    return this.executeWrite(STORES.SEARCH_HISTORY, (store) => store.add(fullEntry));
  }

  /**
   * Get recent search history
   */
  async getRecentSearchHistory(limit = 10): Promise<SearchHistoryEntry[]> {
    const db = await this.getConnection();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SEARCH_HISTORY, 'readonly');
      const store = transaction.objectStore(STORES.SEARCH_HISTORY);
      const index = store.index('timestamp');
      const results: SearchHistoryEntry[] = [];

      // Open cursor in descending order (newest first)
      const request = index.openCursor(null, 'prev');

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value as SearchHistoryEntry);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Clear all search history
   */
  async clearSearchHistory(): Promise<void> {
    await this.executeWrite(STORES.SEARCH_HISTORY, (store) => store.clear());
  }

  // ============================================
  // Utility Operations
  // ============================================

  /**
   * Clear all data from all stores
   */
  async clearAllData(): Promise<void> {
    const db = await this.getConnection();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [STORES.USERS, STORES.PREFERENCES, STORES.SEARCH_HISTORY],
        'readwrite'
      );

      transaction.objectStore(STORES.USERS).clear();
      transaction.objectStore(STORES.PREFERENCES).clear();
      transaction.objectStore(STORES.SEARCH_HISTORY).clear();

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }
}

// Export the singleton instance getter
export const getDatabase = () => DatabaseService.getInstance();

// Export for type usage
export { STORES };

