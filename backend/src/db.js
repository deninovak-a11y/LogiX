import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'logix.sqlite');
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON;');

      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'dispatcher'
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          contact_person TEXT,
          phone TEXT,
          email TEXT
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS drivers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT,
          license TEXT,
          status TEXT NOT NULL DEFAULT 'available'
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS vehicles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          plate TEXT UNIQUE NOT NULL,
          type TEXT NOT NULL,
          capacity_weight REAL NOT NULL DEFAULT 0,
          capacity_volume REAL NOT NULL DEFAULT 0,
          driver_id INTEGER,
          is_active INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY(driver_id) REFERENCES drivers(id)
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          title TEXT NOT NULL,
          order_date TEXT NOT NULL,
          pickup_address TEXT,
          delivery_address TEXT,
          pickup_lat REAL,
          pickup_lng REAL,
          delivery_lat REAL,
          delivery_lng REAL,
          pickup_time TEXT,
          delivery_time TEXT,
          weight REAL NOT NULL DEFAULT 0,
          volume REAL NOT NULL DEFAULT 0,
          priority TEXT NOT NULL DEFAULT 'normal',
          status TEXT NOT NULL DEFAULT 'new',
          notes TEXT,
          FOREIGN KEY(customer_id) REFERENCES customers(id)
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS tours (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vehicle_id INTEGER,
          driver_id INTEGER,
          tour_date TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'planned',
          notes TEXT,
          FOREIGN KEY(vehicle_id) REFERENCES vehicles(id),
          FOREIGN KEY(driver_id) REFERENCES drivers(id)
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS tour_stops (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tour_id INTEGER NOT NULL,
          order_id INTEGER NOT NULL,
          sequence INTEGER NOT NULL,
          stop_type TEXT NOT NULL,
          address TEXT,
          lat REAL,
          lng REAL,
          FOREIGN KEY(tour_id) REFERENCES tours(id),
          FOREIGN KEY(order_id) REFERENCES orders(id)
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          details TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      db.run('CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);');
      db.run('CREATE INDEX IF NOT EXISTS idx_tours_date ON tours(tour_date);');

      db.on('error', (error) => reject(error));
      db.on('open', () => resolve());
    });
  });
}

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });
}
