'use strict';

const Chalk = require('chalk');
const Promise = require('bluebird');

const Base = require('./base');
const GitToEs = require('../index');
const LibUtils = require('../lib/utils');

/*
    Push Command
*/
class Push extends Base {

    constructor() {
        super();
    }

    exec(infoType, commandOptions) {
        let self = this;
        let gitToEs;
        return new Promise((resolve, reject) => {
            Promise.resolve()
                .then(() => {
                    return self.getEsClient(commandOptions.hosts);
                })
                .then((esClient) => {
                    commandOptions.esClient = esClient;
                    gitToEs = self.getGitToEsClient(commandOptions);
                    return gitToEs.init();
                })
                .then(() => {
                    let infoToPush = commandOptions.infoType;
                    if (!infoToPush) {
                        console.log(Chalk.bold.red(LibUtils.genError('Provide info type to push to es')));
                        process.exit(1);
                    }

                    switch (infoToPush) {
                        case 'commits':
                            return gitToEs.pushCommits();
                            break;
                        case 'tags':
                            return gitToEs.pushTags();
                            break;
                        default:
                            return Promise.reject(LibUtils.genError('Given info type is not supported, supported are (commits,tags)'));
                            break;
                    }
                })
                .then(() => {
                    resolve();
                    console.log(Chalk.bold.cyan('Info pushed successfully'));
                    process.exit(0);
                })
                .catch((error) => {
                    reject(error);
                    console.log(Chalk.bold.red(error.message || error.trim()));
                    process.exit(1);
                });

        });
    }
}

module.exports = new Push();