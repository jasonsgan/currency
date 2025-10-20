const express = require('express');
const logger = require('./logger'); 
const { apiLogger, errorHandler, invalidRouteHandler } = require('./middleware');
const { getCurrency } = require('./currencyService');

const port = 8000;

const app = express();

app.use(express.json());
app.use(apiLogger);

app.get("/currencies", async (req, res) => {
    const country = req.query.country;
    const currency = await getCurrency(req.context, country);
    res.json(currency);
});

app.use(invalidRouteHandler);
app.use(errorHandler);

app.listen(port, () => {
    logger.info({
        event: 'SERVER START',
        port
    });
});
