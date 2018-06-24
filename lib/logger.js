'use strict';

const _ = require('lodash');
const Moment = require('moment');
const Logger = new (require('uuid-logger'))();

const formatter = (logEntry) => {
    let timeStamp = Moment().format('YYYY-MM-DD HH:mm:ss.MS');
    return timeStamp + ' - ' + logEntry.level + ': ' + _.get(logEntry, 'meta.message');
};

Logger.addTransport({
    console: {
        name: 'Console Logger',
        level: 'debug',
        colorize: true,
        formatter: formatter
    }
});

module.exports = Logger.getLogger();
