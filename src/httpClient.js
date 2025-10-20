const logger = require('./logger'); 

exports.get = async (context, url) => {
    return await call(context, url, 'GET');
};

const call = async (context, url, method, headers = {}, body) => {
    const start = process.hrtime.bigint();

    logger.info({
        event: 'HTTP START',
        method,
        url,
        ...context
    })

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    });
    
    let status = response.status;
    let text = await response.text();

    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000; // ns to ms

    // pretend server returned bad gateway
    if (url.includes('zzz')) {
        status = 502;
        text = "Bad Gateway";
    }

    logger.info({
        event: 'HTTP END',
        method,
        url,
        status,
        body: text,
        millis: Math.round(duration),
        ...context
    });

    return {
        ok: response.ok,
        status,
        body: parseJson(text)
    };
}

const parseJson = (text) => {
    try {
        return JSON.parse(text);
    } catch (err) {
        const jsonStr = JSON.stringify(text);
        return JSON.parse(jsonStr);
    }
}
