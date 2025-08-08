import Database from 'better-sqlite3';
import { Pool } from 'pg';

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL;
const USE_POSTGRES = process.env.USE_POSTGRES === 'true' || !!DATABASE_URL;

let sqliteDb: Database.Database | null = null;
let pgPool: Pool | null = null;

// Initialize database connection
export function initializeDatabase() {
  if (USE_POSTGRES && DATABASE_URL) {
    // Use PostgreSQL
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    console.log('Using PostgreSQL database');
    return pgPool;
  } else {
    // Use SQLite
    try {
      sqliteDb = new Database('uwapp.db');
      console.log('Using SQLite database');
      
      // Create tables if they don't exist
      createTables();
      return sqliteDb;
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }
}

// Create SQLite tables
function createTables() {
  if (!sqliteDb) return;

  // Users table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Courses table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      credits INTEGER NOT NULL,
      description TEXT,
      prerequisites TEXT,
      quarter TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User courses (for course planning)
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS user_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      quarter TEXT NOT NULL,
      year INTEGER NOT NULL,
      status TEXT DEFAULT 'planned',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (course_id) REFERENCES courses (id)
    )
  `);
}

// Get database instance
export function getDatabase() {
  return USE_POSTGRES ? pgPool : sqliteDb;
}

// Close database connections
export function closeDatabase() {
  if (sqliteDb) {
    sqliteDb.close();
  }
  if (pgPool) {
    pgPool.end();
  }
}

// Database query helper
export async function query(sql: string, params: any[] = []) {
  if (USE_POSTGRES && pgPool) {
    const result = await pgPool.query(sql, params);
    return result.rows;
  } else if (sqliteDb) {
    const stmt = sqliteDb.prepare(sql);
    return stmt.all(params);
  }
  throw new Error('No database connection available');
}

// Database execute helper (for INSERT, UPDATE, DELETE)
export function execute(sql: string, params: any[] = []) {
  if (USE_POSTGRES && pgPool) {
    return pgPool.query(sql, params);
  } else if (sqliteDb) {
    const stmt = sqliteDb.prepare(sql);
    return stmt.run(params);
  }
  throw new Error('No database connection available');
}
