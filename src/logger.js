const pino = require('pino');

const logger = pino({
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    formatters: {
        level(label) {
            return { level: label };
        },
    }
});

module.exports = logger;