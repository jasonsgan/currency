const express = require('express');
const bcrypt = require('bcrypt');
const logger = require('./logger'); 
const { apiLogger, jsonParser, errorHandler, invalidRouteHandler } = require('./middleware');
const { getCurrency } = require('./currencyService');
const { InvalidRequestError } = require('./errors');

const port = 8000;

const app = express();

app.use(express.text({ type: '*/*' }));

app.get("/api/health", (req, res) => {
    res.json( { status: "OK" } );
});

app.use(apiLogger);
app.use(jsonParser);

/*
app.get("/api/currencies", async (req, res) => {
    const country = req.query.country;
    if (typeof country !== 'string' || country.length === 0) {
        throw new InvalidRequestError(`URL parameter 'country' must be a non-empty string`);
    }
    const currency = await getCurrency(req.context, country);
    res.json(currency);
});
*/

app.post("/api/hash", async (req, res) => {
    const plaintext = req.body.plaintext;
    if (typeof plaintext !== 'string' || plaintext.length === 0) {
        throw new InvalidRequestError(`JSON property 'plaintext' must be a non-empty string`);
    }
    const hash = await bcrypt.hash(plaintext, 11);
    res.send({ 
        status: 200, 
        plaintext, 
        hash, 
        algo: 'bcrypt', 
        rounds: 11
    });
});

app.use(invalidRouteHandler);
app.use(errorHandler);

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

process.on('SIGTERM', () => {
    server.close(() => {
        logger.info({
            event: "SERVER END",
            message: "Received SIGTERM"
        });
        process.exit(0);
    });
});