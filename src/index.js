// 3rd Party
const _ = require('lodash');
const Promise = require('bluebird');

// Internal
const LibEs = require('./lib/es');
const LibGit = require('./lib/git');
const LibUtils = require('./lib/utils');
const GitConfig = require('./config/git');
const ResponseCodes = require('./helpers/responseCode');

const allowedOrigins = GitConfig.allowedOrigins;

class GitToEs {
    constructor(options) {
        let self = this;

        // Not supporting es config as it will be 
        // unnecessary to have more than one client in project
        let esClient = _.get(options, 'es.client');
        if (!esClient) {
            throw LibUtils.genError(
                'No ES client provided',
                ResponseCodes.PRECONDITION_FAILED.status,
                ResponseCodes.PRECONDITION_FAILED.code
            );
        }

        let index = _.get(options, 'es.index');
        let type = _.get(options, 'es.type');

        if (!index || !type) {
            throw LibUtils.genError(
                'No ES index, type provided',
                ResponseCodes.PRECONDITION_FAILED.status,
                ResponseCodes.PRECONDITION_FAILED.code
            );
        }

        let origin = _.get(options, 'origin');
        if (_.values(allowedOrigins).indexOf(origin) < 0) {
            throw LibUtils.genError(
                'Given origin is not supported, supported ' + _.values(allowedOrigins),
                ResponseCodes.PRECONDITION_FAILED.status,
                ResponseCodes.PRECONDITION_FAILED.code
            );
        }

        let remoteGitRepo = _.get(options, 'remoteGitRepo');
        let workingDirPath = _.get(options, 'workingDirPath');
        if (origin === allowedOrigins.REMOTE && !remoteGitRepo) {
            throw LibUtils.genError(
                'No remote url provided, \
                Format(https://github.com/yogeshyadav108098/git-to-es)',
                ResponseCodes.PRECONDITION_FAILED.status,
                ResponseCodes.PRECONDITION_FAILED.code
            );
        }
        if (!workingDirPath) {
            throw LibUtils.genError(
                'No working directory provided (Required for both local or remote origin)',
                ResponseCodes.PRECONDITION_FAILED.status,
                ResponseCodes.PRECONDITION_FAILED.code
            );
        }

        self.esClient = new LibEs({
            client: esClient,
            index: index,
            type: type,
            logger: console
        });

        self.gitRepo = new LibGit({
            origin: origin,
            remoteGitRepo: remoteGitRepo,
            workingDirPath: workingDirPath,
            logger: console
        });

        self.initiated = false;
    }

    init() {
        let self = this;

        return new Promise((resolve, reject) => {
            self.esClient.init()
                .then(() => self.gitRepo.init())
                .then(() => {
                    self.initiated = true;
                    return resolve();
                })
                .error(error => reject(error));
        });
    }

    pushCommits() {
        let self = this;
        if (!self.initiated) {
            return Promise.reject('Please initiate GitToEs, before using');
        }

        return new Promise((resolve, reject) => {
            self.gitRepo.getHistory()
                .then(historyList => self.esClient.push(historyList))
                .then(resolve)
                .error(error => reject(error));
        });
    }

    pushTags() {
        let self = this;
        if (!self.initiated) {
            return Promise.reject(LibUtils.genError('Please initiate GitToEs, before using'));
        }

        return new Promise((resolve, reject) => {
            self.gitRepo.getTags()
                .then(tagsList => self.esClient.push(tagsList))
                .then(resolve)
                .error(error => reject(error));
        });
    }
}


module.exports = GitToEs;

(function (options) {
    if (require.main === module) {
        const Elasticsearch = require('elasticsearch');
        let elasticClientC = new Elasticsearch.Client({
            host: {
                host: '127.0.0.1',
                port: 9200
            }
        });

        let gitToEs = new GitToEs({
            es: {
                client: elasticClientC,
                index: 'keyvalueindex',
                type: 'keyvaluetype'
            },
            origin: 'local',
            workingDirPath: '/Users/yogesh.yadav/Downloads/PersonalSpace/Work/Code/Paytm/Gold-And-Loans-Bangalore/wealthmgmt'
        })

        gitToEs.init()
            .then(() => gitToEs.pushCommits())
            .then(() => gitToEs.pushTags())
            .then(Promise.resolve)
            .error(error => Promise.reject(error));
    }
})();
