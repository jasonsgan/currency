const httpClient = require('./httpClient');
const { InvalidRequestError, UnexpectedHttpStatusError } = require('./errors');

exports.getCurrency = async (context, country) => {
    const  encCountry = encodeURIComponent(country);
    const url = `https://restcountries.com/v3.1/alpha/${encCountry}?fields=currencies`;
    
    const res = await httpClient.get(context, url);
    
    if (res.status === 404) { // country not found
        throw new InvalidRequestError(`Invalid country: ${country}`);
    } else if (res.status !== 200) { 
        throw new UnexpectedHttpStatusError(res.status);
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