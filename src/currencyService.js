const httpClient = require('./httpClient');

exports.getCurrency = async (context, country) => {
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