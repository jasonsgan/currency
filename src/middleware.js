
const { uuidv7 } = require('uuidv7');
const logger = require('./logger'); 

exports.apiLogger = (req, res, next) => {

    const start = process.hrtime.bigint();

    const context = {
        endpoint: req.method + ' ' + req.path,
        cid: req.get('X-Correlation-ID') || uuidv7(),
        reqId: uuidv7()
    }
    req.context = context;

    logger.info({
        event: 'API START',
        method: req.method,
        url: req.originalUrl,
        ...context
    });

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
    logger.error({
        event: 'ERROR',
        status: err.status,
        message: err.message,
        stack: err.stack,
        ...req.context
    });

    const status = err.status || 500;
    const message = err.message || 'Error processing request';
    res.status(status).json({ status, message });
};

exports.invalidRouteHandler = (req, res, next) => {
    res.message = 'Invalid route';
    res.status(404).send( { status: 404, message: "Invalid route" });
};
