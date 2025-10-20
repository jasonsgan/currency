const httpClient = require('./httpClient');
const { InvalidRequestError, SystemError } = require('./errors');

exports.getCurrency = async (context, country) => {
    const  encCountry = encodeURIComponent(country);
    const url = `https://restcountries.com/v3.1/alpha/${encCountry}?fields=currencies`;
    
    if (country === 'zzz') {
        throw new Error("DB Error");
    }
    
    const res = await httpClient.get(context, url);
    
    if (res.status === 404) { // country not found
        throw new InvalidRequestError(`Invalid country: ${country}`);
    } else if (res.status !== 200) { 
        throw new SystemError();
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