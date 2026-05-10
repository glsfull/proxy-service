import Database from 'better-sqlite3'
import { join } from 'path'
import { mkdirSync } from 'fs'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'app.db')
    mkdirSync(join(process.cwd(), 'data'), { recursive: true })
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema(db)
  }
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT,
      is_admin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      marketplace TEXT NOT NULL DEFAULT 'wildberries',
      wb_token TEXT,
      company_name TEXT,
      inn TEXT,
      contact_name TEXT,
      seller_name TEXT,
      seller_id TEXT,
      seller_rating REAL,
      token_expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS marketplace_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      marketplace TEXT NOT NULL DEFAULT 'wildberries',
      credentials_ref TEXT,
      seller_name TEXT,
      external_account_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, marketplace)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS request_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      status_code INTEGER,
      duration_ms INTEGER,
      ip TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  // Migration: add is_admin if missing (for existing databases)
  try {
    db.exec(`ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0`)
  } catch {
    // Column already exists
  }

  // Migration: add seller info and token expiry columns to profiles
  const migrations = [
    `ALTER TABLE profiles ADD COLUMN marketplace TEXT NOT NULL DEFAULT 'wildberries'`,
    `ALTER TABLE profiles ADD COLUMN seller_name TEXT`,
    `ALTER TABLE profiles ADD COLUMN seller_id TEXT`,
    `ALTER TABLE profiles ADD COLUMN seller_rating REAL`,
    `ALTER TABLE profiles ADD COLUMN token_expires_at TEXT`
  ]
  for (const sql of migrations) {
    try { db.exec(sql) } catch { /* column already exists */ }
  }

  db.exec(`
    INSERT INTO marketplace_connections
      (user_id, marketplace, credentials_ref, seller_name, external_account_id, status, created_at, updated_at)
    SELECT
      user_id,
      'wildberries',
      wb_token,
      seller_name,
      seller_id,
      CASE WHEN wb_token IS NOT NULL AND length(wb_token) > 10 THEN 'active' ELSE 'draft' END,
      created_at,
      updated_at
    FROM profiles
    WHERE wb_token IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM marketplace_connections mc
        WHERE mc.user_id = profiles.user_id
          AND mc.marketplace = 'wildberries'
      );
  `)
}
