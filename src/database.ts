import fs from "node:fs";
import path from "node:path";
import type { Database } from "./types";

const DEFAULT_DATA_FILE = "data/db.json";

function getDatabasePath(): string {
  const dataFile = process.env.DATA_FILE || DEFAULT_DATA_FILE;
  return path.resolve(process.cwd(), dataFile);
}

export function readDatabase(): Database {
  const content = fs.readFileSync(getDatabasePath(), "utf-8");
  return JSON.parse(content) as Database;
}

export function writeDatabase(database: Database) {
  fs.writeFileSync(getDatabasePath(), JSON.stringify(database, null, 2));
}