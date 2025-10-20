
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

class SystemError extends Error {
    constructor() {
        super('System error');
        this.status = 500;
    }
}

module.exports = { InvalidRequestError, InvalidRouteError, SystemError };