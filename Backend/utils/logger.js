// utils/logger.js
const isProd = process.env.NODE_ENV === 'production';

const logger = {
  log: (...args) => {
    if (!isProd) console.log('[LOG]', ...args);
  },
  warn: (...args) => {
    if (!isProd) console.warn('[WARN]', ...args);
  },
  error: (...args) => {
    if (!isProd) console.error('[ERROR]', ...args);
  },
};

export default logger;
