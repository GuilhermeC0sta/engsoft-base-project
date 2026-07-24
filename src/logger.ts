type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, message: string, meta?: unknown): void {
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}`;
  const write = level === "error" ? console.error : console.log;

  if (meta !== undefined) {
    write(line, meta);
    return;
  }

  write(line);
}

export const logger = {
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
};
