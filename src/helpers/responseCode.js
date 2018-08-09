'use strict';

module.exports = {
    // 2XX
    OK: {
        code: 'OK',
        status: 200,
        message: 'Processed'
    },
    CREATED: {
        code: 'CREATED',
        status: 201,
        message: 'Requested resource created'
    },
    ACCEPTED: {
        code: 'ACCEPTED',
        status: 202,
        message: 'Accepted for processing'
    },
    NO_CONTENT: {
        code: 'NO_CONTENT',
        status: 204,
        message: 'Processed the request but no content for returning'
    },
    CONFLICT: {
        code: 'CONFLICT',
        status: 409,
        message: 'Requested resource already exists'
    },
    PRECONDITION_FAILED: {
        code: 'PRECONDITION_FAILED',
        status: 412,
        message: 'Mandatory parameters missing'
    },
    UNABLE_TO_PROCESS: {
        code: 'UNABLE_TO_PROCESS',
        status: 422,
        message: 'Unable to process given request'
    },
    INTERNAL_SERVER_ERROR: {
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
        message: 'Unexpected error occurred, Please report'
    },

    custom: function (message, status, code) {
        message = message || 'Unexpected error occurred, Please report';
        status = status || 422;
        code = code || 'UNABLE_TO_PROCESS';

        let response = {
            message,
            status,
            code
        };
        return response;
    }
};
