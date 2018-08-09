'use strict';

class Utils {
    constructor() { }

    genError(message, status, code) {
        let error = new Error(message || 'Unexpected error occurred, Please report');
        error.status = status ? status : 500;
        error.code = code;
        return error;
    }
}

module.exports = new Utils();
