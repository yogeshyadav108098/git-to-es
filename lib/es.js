// 3rd Party
const _ = require('lodash');
const Promise = require('bluebird');


class Es {
    constructor(options) {
        let self = this;
        self.type = _.get(options, 'type');
        self.index = _.get(options, 'index');
        self.client = _.get(options, 'client');
        self.logger = _.get(options, 'logger');
    }

    init() {
        let self = this;
        self.logger.debug('Initiating ES Client');
        return new Promise((resolve, reject) => {
            // Try to ping client
            self.client.ping({
                requestTimeout: 30000
            }, function (error) {
                if (error) {
                    self.logger.error(error);
                    return reject(error);
                }
                self.logger.info('ES client initiated');
                return resolve();
            });
        });
    }

    push(body) {
        let self = this;
        self.logger.debug('Pushing body to ES, total elements', body.length);

        let esUpdateList = [];
        body.forEach((element) => {
            esUpdateList.push({
                update: {
                    _id: element.id,
                    _type: self.type,
                    _index: self.index,
                    retry_on_conflict: 3
                }
            });
            esUpdateList.push({
                doc: element,
                doc_as_upsert: true
            });
        });

        return self.client.bulk({
            body: esUpdateList
        });
    }
}

module.exports = Es;