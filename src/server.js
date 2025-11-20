const express = require('express');
const bcrypt = require('bcrypt');
const logger = require('./logger'); 
const { apiLogger, jsonParser, errorHandler, invalidRouteHandler } = require('./middleware');
const { InvalidRequestError } = require('./errors');

const configureExpressApp = () => {
    const app = express();

    app.use(express.text({ type: '*/*' }));

    app.get("/api/health", (req, res) => {
        res.json( { status: "OK" } );
    });

    app.use(apiLogger);
    app.use(jsonParser);

    app.post("/api/hash", async (req, res) => {
        const rounds = 10
        const plaintext = req.body.plaintext;
        if (typeof plaintext !== 'string' || plaintext.length === 0) {
            throw new InvalidRequestError(`JSON property 'plaintext' must be a non-empty string`);
        }
        const hash = await bcrypt.hash(plaintext, rounds);
        res.send({ 
            status: 200, 
            plaintext, 
            hash, 
            algo: 'bcrypt', 
            rounds
        });
    });

    app.use(invalidRouteHandler);
    app.use(errorHandler);

    return app;
}

const configureExpressServer = (app) => {
    const port = 8000;

    const server = app.listen(port, () => {
        logger.info({
            event: 'SERVER START',
            message: `Server listening on port ${port}`
        });
    });

    server.on('error', (err) => {
        logger.error({
            event: 'ERROR',
            message: err.message,
            stack: err.stack,
        });
        process.exit(1);
    });

    process.on('SIGINT', () => {
        server.close(() => {
            logger.info({
                event: "SERVER END",
                message: "Received SIGINT"
            });
            process.exit(0);
        });
    });
}

const app = configureExpressApp();

if (process.env.LAMBDA_TASK_ROOT) {
    const serverless = require('serverless-http');
    module.exports.handler = serverless(app);
} else {
    configureExpressServer(app);
}
