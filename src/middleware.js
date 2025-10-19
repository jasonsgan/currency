
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
        ...context,
        event: 'API START',
        method: req.method,
        url: req.originalUrl
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
            ...context,
            event: 'API END',
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            body: res.body,
            millis: Math.round(duration)
        });
    });

    next();
};

exports.errorHandler = (err, req, res, next) => {
    err.reqId = req.context.reqId;
    err.cid = req.context.cid;
    logger.error({
        ...req.context,
        event: 'ERROR',
        message: err.message,
        stack: err.stack
    });

    const status = 500;
    res.status(status).json({ status, message: "Error processing request" });
};

exports.invalidRouteHandler = (req, res, next) => {
    res.message = 'Invalid route';
    res.status(404).send( { status: 404, message: "Invalid route" });
};
