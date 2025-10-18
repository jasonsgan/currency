const express = require('express');
const { apiLogger, errorHandler, invalidRouteHandler } = require('./middleware');
const httpClient = require('./httpClient');

const port = 8000;

const app = express();

app.use(express.json());
app.use(apiLogger);

app.get("/currencies", async (req, res, next) => {
    const country = req.query.country;
    const currency = await getCurrency(req.context, country);
    res.send(currency);
});

app.use(errorHandler);
app.use(invalidRouteHandler);

app.listen(port, () => {
    console.log(`Currency server is listening on port ${port}`);
});

const getCurrency = async (context, country) => {
    const url = `https://restcountries.com/v3.1/alpha/${country}?fields=currencies`;
    const res = await httpClient.get(context, url);
    if (!res.ok) {
        throw new Error(`Get Currency API failed for country ${country}`);
    }
    const currencies = res.body.currencies;
    const code = Object.keys(currencies)[0];
    const currency = currencies[code];
    return {
        code,
        name: currency.name,
        symbol: currency.symbol
    };
}
