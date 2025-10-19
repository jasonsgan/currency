const httpClient = require('./httpClient');

exports.getCurrency = async (context, country) => {
    const  encCountry = encodeURIComponent(country);
    const url = `https://restcountries.com/v3.1/alpha/${encCountry}?fields=currencies`;
    
    const res = await httpClient.get(context, url);
    
    if (!res.ok) {
        const err = new Error(`Invalid country: ${country}`);
        err.status = 400;
        throw err;
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