

exports.get = async (context, url) => {
    return await call(context, url, 'GET');
};

const call = async (context, url, method, headers = {}, body) => {
    const start = process.hrtime.bigint();

    console.log({
        ...context,
        type: 'API-SEND',
        method,
        url
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
    
    const status = response.status;
    const text = await response.text();

    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000; // ns to ms

    console.log({
        ...context,
        type: 'API-RECV',
        method,
        url,
        status,
        body: text,
        millis: Math.round(duration)
    });

    return {
        ok: response.ok,
        status: response.status,
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
