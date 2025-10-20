
class InvalidRequestError extends Error {
    constructor(message) {
        super(message);
        this.status = 400;
    }
}

class InvalidRouteError extends InvalidRequestError {
    constructor(method, url) {
        super(`Invalid route: ${method} ${url}`);
        this.status = 404;
    }
}

class UnexpectedHttpStatusError extends Error {
    constructor(status) {
        super(`Unexpected HTTP status: ${status}`);
    }
}

module.exports = { InvalidRequestError, InvalidRouteError, UnexpectedHttpStatusError };