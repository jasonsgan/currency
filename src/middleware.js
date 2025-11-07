
const { uuidv7 } = require('uuidv7');
const logger = require('./logger'); 
const { InvalidRequestError, InvalidRouteError } = require('./errors');

exports.apiLogger = (req, res, next) => {

    const start = process.hrtime.bigint();

    const context = {
        endpoint: req.method + ' ' + req.path,
        cid: req.get('X-Correlation-ID') || uuidv7(),
        reqId: uuidv7()
    }
    req.context = context;

    if (req.body) {
        logger.info({
            event: 'API START',
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            ...context
        });
    } else {
        logger.info({
            event: 'API START',
            method: req.method,
            url: req.originalUrl,
            ...context
        });
    }

    const originalSend = res.send;
    res.send = (body) => {
        res.body = body;
        originalSend.call(res, body);
    };
    
    res.on('finish', () => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1_000_000; // ns to ms

        logger.info({
            event: 'API END',
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            body: res.body,
            millis: Math.round(duration),
            ...context
        });
    });

    next();
};

exports.errorHandler = (err, req, res, next) => {
    if (err instanceof InvalidRequestError || err instanceof SyntaxError) {
        logger.warn({
            event: 'INVALID REQUEST',
            status: 400,
            message: err.message,
            ...req.context
        });
        const status = 400;
        const message = err.message;
        res.status(status).json({ status, message });
    } else {
        logger.error({
            event: 'ERROR',
            status: err.status,
            message: err.message,
            stack: err.stack,
            ...req.context
        });
        const status = 500;
        const message = 'System error'
        res.status(status).json({ status, message });
    }
};

exports.invalidRouteHandler = (req, res, next) => {
    const context = req.context;
    if (context) {
        delete context.endpoint;
    }
    throw new InvalidRouteError(req.method, req.originalUrl);
};
