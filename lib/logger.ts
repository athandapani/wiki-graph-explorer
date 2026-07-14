type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

function log(level: LogLevel, message: string): void {
  process.stderr.write(`[${level}] ${message}\n`);
}

export function debug(message: string): void {
  log("DEBUG", message);
}

export function info(message: string): void {
  log("INFO", message);
}

export function warn(message: string): void {
  log("WARN", message);
}

export function error(message: string): void {
  log("ERROR", message);
}
