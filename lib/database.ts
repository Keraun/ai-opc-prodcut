import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DATABASE_PATH = path.join(DATABASE_DIR, 'app.db')

export function getDatabase(): Database.Database {
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, { recursive: true })
  }
  
  const db = new Database(DATABASE_PATH)
  db.pragma('journal_mode = WAL')
  
  return db
}

export function initializeDatabase(): void {
  const db = getDatabase()
  
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        remark TEXT,
        must_change_password INTEGER DEFAULT 0,
        last_login_time TEXT,
        last_login_ip TEXT,
        current_login_ip TEXT,
        current_login_time TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_key TEXT UNIQUE NOT NULL,
        config_value TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_id INTEGER UNIQUE,
        username TEXT,
        type TEXT NOT NULL,
        description TEXT,
        ip TEXT,
        timestamp TEXT,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS theme_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        theme_id TEXT UNIQUE NOT NULL,
        theme_name TEXT NOT NULL,
        theme_config TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        type TEXT DEFAULT 'static',
        description TEXT,
        status TEXT DEFAULT 'draft',
        is_system INTEGER DEFAULT 0,
        is_deletable INTEGER DEFAULT 1,
        route TEXT,
        dynamic_param TEXT,
        module_instance_ids TEXT DEFAULT '[]',
        created_at TEXT,
        updated_at TEXT,
        published_at TEXT
      );

      CREATE TABLE IF NOT EXISTS module_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id TEXT UNIQUE NOT NULL,
        module_name TEXT NOT NULL,
        schema TEXT,
        default_data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS page_modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_instance_id TEXT UNIQUE NOT NULL,
        page_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        module_name TEXT NOT NULL,
        module_order INTEGER NOT NULL,
        data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES pages(page_id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);
      CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
      CREATE INDEX IF NOT EXISTS idx_system_logs_type ON system_logs(type);
      CREATE INDEX IF NOT EXISTS idx_system_logs_username ON system_logs(username);
      CREATE INDEX IF NOT EXISTS idx_pages_page_id ON pages(page_id);
      CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
      CREATE INDEX IF NOT EXISTS idx_module_registry_module_id ON module_registry(module_id);
      CREATE INDEX IF NOT EXISTS idx_page_modules_page_id ON page_modules(page_id);
      CREATE INDEX IF NOT EXISTS idx_page_modules_module_instance_id ON page_modules(module_instance_id);
    `)
    
    console.log('Database initialized successfully')
  } finally {
    db.close()
  }
}

export function resetDatabase(): void {
  const db = getDatabase()
  
  try {
    db.exec(`
      DROP TABLE IF EXISTS accounts;
      DROP TABLE IF EXISTS system_config;
      DROP TABLE IF EXISTS system_logs;
      DROP TABLE IF EXISTS theme_config;
      DROP TABLE IF EXISTS pages;
      DROP TABLE IF EXISTS module_registry;
      DROP TABLE IF EXISTS page_modules;
    `)
    
    initializeDatabase()
    console.log('Database reset successfully')
  } finally {
    db.close()
  }
}
