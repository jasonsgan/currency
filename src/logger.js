const pino = require('pino');

const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: {
        target: 'pino-pretty',
        options: {
            translateTime: 'yyyy-mm-dd HH:MM:ss Z',
            colorize: true,
            ignore: 'pid,hostname',
        },
    },
});

module.exports = logger;