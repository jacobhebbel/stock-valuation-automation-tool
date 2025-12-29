class InvalidServiceStringError extends Error {
    constructor (message) { 
        return super(message);
    }
};

class InvalidTickerStringError extends Error {
    constructor (message) {
        return super(message);
    }
};

class FieldNotFoundError extends Error {
    constructor (message) {
        return super(message);
    }
};

module.exports = {
    InvalidServiceStringError,
    InvalidTickerStringError,
    FieldNotFoundError
};
