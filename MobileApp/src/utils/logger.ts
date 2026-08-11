/**
 * Production-Safe Logger Utility
 * Wraps console outputs inside __DEV__ flag checks to prevent debug log leakage in production release builds.
 */

export const logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },

  warn: (...args: any[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },

  error: (...args: any[]) => {
    if (__DEV__) {
      console.error(...args);
    }
  },

  info: (...args: any[]) => {
    if (__DEV__) {
      console.info(...args);
    }
  },
};
