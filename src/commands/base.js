'use strict';

const Chalk = require('chalk');
const Es = require('elasticsearch');
const Promise = require('bluebird');

const GitToEs = require('../index');
const LibUtils = require('../lib/utils');

/*
    Base Command
*/
class Base {

    constructor() { }

    getEsClient(hosts) {
        hosts = hosts.split(',');
        hosts = hosts.map((host) => {
            let hostSplit = host.split(':');
            return {
                host: hostSplit[0],
                port: hostSplit[1]
            }
        });

        let esClient = new Es.Client(hosts);
        return new Promise((resolve, reject) => {
            Promise.resolve()
                .then(() => {
                    return esClient.ping();
                })
                .then(() => {
                    return resolve(esClient);
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    getGitToEsClient(options) {
        let repoName = options.repoName;
        if (!repoName) {
            console.log(Chalk.bold.red(LibUtils.genError('Provide repo name')));
            process.exit(1);
        }

        let origin = options.origin;
        if (!origin) {
            console.log(Chalk.bold.red(LibUtils.genError('Provide origin (local/remote)')));
            process.exit(1);
        }

        let originPath;
        switch (origin) {
            case 'local':
                originPath = options.workingDirPath;
                break;
            case 'remote':
                break;
            default:
                console.log(Chalk.bold.red(LibUtils.genError('Given origin is not supported, supported are (local,remove)')));
                process.exit(1);
                break;
        }

        let esClient = options.esClient;
        return new GitToEs({
            es: {
                client: esClient,
                index: 'gitInfoToEs'.toLowerCase().trim(),
                type: ('gitInfoToEs-' + repoName).toLowerCase().trim()
            },
            origin,
            workingDirPath: originPath
            // workingDirPath: '/Users/yogesh.yadav/Downloads/PersonalSpace/Work/Code/Paytm/Gold-And-Loans-Bangalore/wealthmgmt'
        });
    }
}

module.exports = Base;