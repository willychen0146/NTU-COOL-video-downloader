// utils/logger.js

export class Logger {
  info(message) {
    console.log(`[INFO] ${message}`);
  }

  error(message, error) {
    console.error(`[ERROR] ${message}`, error);
  }
}