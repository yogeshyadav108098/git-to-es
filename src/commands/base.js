'use strict';

const Es = require('elasticsearch');
const Promise = require('bluebird');

const GitToEs = require('../index');
const LibUtils = require('../lib/utils');
const ResponseCodes = require('../helpers/responseCode');

/*
    Base Command
*/
class Base {

    constructor() { }

    getEsClient(hosts) {

        if (!hosts) {
            return Promise.reject(
                LibUtils.genError(
                    'Es hosts not provided',
                    ResponseCodes.PRECONDITION_FAILED.status,
                    ResponseCodes.PRECONDITION_FAILED.code
                )
            );
        }

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
            throw LibUtils.genError(
                'Repo name not provided',
                ResponseCodes.PRECONDITION_FAILED.status,
                ResponseCodes.PRECONDITION_FAILED.code
            );
        }

        let origin = options.origin;
        if (!origin) {
            throw LibUtils.genError(
                'Origin not provided',
                ResponseCodes.PRECONDITION_FAILED.status,
                ResponseCodes.PRECONDITION_FAILED.code
            );
        }

        let originPath;
        switch (origin) {
            case 'local':
                originPath = options.workingDirPath;
                break;
            case 'remote':
                break;
            default:
                throw LibUtils.genError(
                    'Given origin is not supported, supported are (local,remove)',
                    ResponseCodes.PRECONDITION_FAILED.status,
                    ResponseCodes.PRECONDITION_FAILED.code
                );
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
        });
    }
}

module.exports = Base;