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

app.get("/api/currencies", async (req, res) => {
    const country = req.query.country;
    const currency = await getCurrency(req.context, country);
    res.json(currency);
});

app.post("/api/hash", async (req, res) => {
    let plaintext = req.body.plaintext;
    /*
    if (req.body) {
        const body = JSON.parse(req.body);
        plaintext = body.plaintext;
    }
    */
    if (typeof plaintext !== 'string' || plaintext.length === 0) {
        throw new InvalidRequestError(`Invalid plaintext: ${plaintext}`);
    }
    const hash = await bcrypt.hash(plaintext, 11);
    res.send( { status: 200, plaintext, hash } );
});

app.use(invalidRouteHandler);
app.use(errorHandler);

app.listen(port, () => {
    logger.info({
        event: 'SERVER START',
        port
    });
});
