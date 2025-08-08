import sqlite3 from 'sqlite3';
import { promisify } from 'util';

let db: sqlite3.Database | null = null;

// Initialize database connection
export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      db = new sqlite3.Database('uwapp.db', (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
          return;
        }
        
        console.log('SQLite database connected successfully');
        
        // Create tables if they don't exist
        createTables()
          .then(() => resolve())
          .catch(reject);
      });
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      reject(error);
    }
  });
}

// Create SQLite tables
function createTables(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        credits INTEGER NOT NULL,
        description TEXT,
        prerequisites TEXT,
        quarter TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS user_courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        quarter TEXT NOT NULL,
        year INTEGER NOT NULL,
        status TEXT DEFAULT 'planned',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (course_id) REFERENCES courses (id)
      )`
    ];

    let completed = 0;
    const total = tables.length;

    tables.forEach((sql) => {
      db!.run(sql, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
          return;
        }
        
        completed++;
        if (completed === total) {
          console.log('All tables created successfully');
          resolve();
        }
      });
    });
  });
}

// Get database instance
export function getDatabase(): sqlite3.Database | null {
  return db;
}

// Close database connections
export function closeDatabase(): Promise<void> {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Database query helper
export function query(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

// Database execute helper (for INSERT, UPDATE, DELETE)
export function execute(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}
