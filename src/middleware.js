
const { uuidv7 } = require('uuidv7');

exports.apiLogger = (req, res, next) => {
    const start = process.hrtime.bigint();

    const context = {
        cid: req.get('X-Correlation-ID') || uuidv7(),
        reqId: uuidv7(),
    }
    req.context = context;

    console.log({
        ...context,
        type: 'API-IN',
        method: req.method,
        path: req.originalUrl
    });
    
    res.on('finish', () => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1_000_000; // ns to ms

        console.log({
            ...context,
            type: 'API-OUT',
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            millis: Math.round(duration)
        });
    });

    next();
};

exports.errorHandler = (err, req, res, next) => {
    console.log({
        type: 'ERROR',
        ...req.context,
        error: err
    });
    const status = 500;
    res.status(status).json({ status, message: 'Error processing request' });
};

exports.invalidRouteHandler = (req, res, next) => {
    res.message = 'Invalid route';
    res.status(404).send( { status: 404, message: "Invalid route" });
};
