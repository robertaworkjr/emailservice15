import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

class Database {
  constructor() {
    this.db = null;
    this.dbPath = process.env.DB_PATH || './database/emails.db';
  }

  async initialize() {
    try {
      // Ensure database directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath);
      
      // Promisify database methods
      this.db.run = promisify(this.db.run.bind(this.db));
      this.db.get = promisify(this.db.get.bind(this.db));
      this.db.all = promisify(this.db.all.bind(this.db));

      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    const createEmailsTable = `
      CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,
        email_address TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        session_id TEXT,
        INDEX(email_address),
        INDEX(expires_at),
        INDEX(session_id)
      )
    `;

    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        email_id TEXT NOT NULL,
        message_id TEXT UNIQUE,
        sender TEXT NOT NULL,
        subject TEXT,
        body_text TEXT,
        body_html TEXT,
        received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        attachments TEXT,
        is_read BOOLEAN DEFAULT 0,
        FOREIGN KEY (email_id) REFERENCES emails (id) ON DELETE CASCADE,
        INDEX(email_id),
        INDEX(received_at),
        INDEX(message_id)
      )
    `;

    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT
      )
    `;

    await this.db.run(createEmailsTable);
    await this.db.run(createMessagesTable);
    await this.db.run(createSessionsTable);
  }

  async close() {
    if (this.db) {
      await new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
}

export default new Database();