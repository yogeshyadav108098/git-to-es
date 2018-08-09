// 3rd Party
const _ = require('lodash');
const NodeGit = require("nodegit");
const Promise = require('bluebird');

// Internal
const GitConfig = require('../config/git');

const allowedOrigins = GitConfig.allowedOrigins;

class GitRepo {
    constructor(options) {
        let self = this;
        self.origin = _.get(options, 'origin');
        self.remoteGitRepo = _.get(options, 'remoteGitRepo');
        self.workingDirPath = _.get(options, 'workingDirPath');
    }

    init() {
        let self = this;

        return new Promise(function (resolve, reject) {

            let promiseArray = [];

            if (self.origin === allowedOrigins.REMOTE) {
                promiseArray.push(NodeGit.Clone(self.remoteGitRepo, self.workingDirPath));
            }
            if (self.origin === allowedOrigins.LOCAL) {
                promiseArray.push(NodeGit.Repository.open(self.workingDirPath));
            }

            Promise.all(promiseArray)
                .then(resolve)
                .catch(error => reject(error))
        });
    }

    getHistory() {
        let self = this;

        return new Promise(function (resolve, reject) {
            NodeGit.Repository.open(self.workingDirPath)
                .then(repo => repo.getMasterCommit())
                .then(firstCommitOnMaster => firstCommitOnMaster.history(NodeGit.Revwalk.SORT.TIME))
                .then(history => getHistoryList(history))
                .then(historyList => resolve(historyList))
                .catch((error) => reject(error));
        });
    }

    getTags() {
        let self = this;
        console.log('Getting Tags');

        let repo;
        return new Promise(function (resolve, reject) {
            NodeGit.Repository.open(self.workingDirPath)
                .then(result => {
                    repo = result;
                    return Promise.resolve(repo);
                })
                .then(repo => repo.fetchAll({
                    callbacks: {
                        credentials: function (url, userName) {
                            return NodeGit.Cred.sshKeyFromAgent(userName);
                        }
                    }
                }, true))
                .then(() => repo.getReferenceNames(NodeGit.Reference.TYPE.LISTALL))
                .then(referenceNames => getTagsList(repo, referenceNames))
                .then(tagsList => resolve(tagsList))
                .catch((error) => reject(error));
        });
    }
}

const getTagsList = (repo, referenceNames) => {
    let promiseArray = [];
    let tagsList = [];

    cinsole.log(referenceNames);
    referenceNames.forEach((referenceName) => {
        console.log(referenceName);
        promiseArray.push(
            repo.getReference(referenceName)
                .then(reference => {
                    if (reference.isTag()) {
                        let referenceSplit = referenceName.split('/');
                        let tagElement = {
                            id: referenceSplit[referenceSplit.length - 1],
                            name: referenceName,
                            oId: reference.target().toString()
                        };

                        tagsList.push(tagElement);
                    }
                })
        );
    });

    return Promise.all(promiseArray)
        .then(() => Promise.resolve(tagsList))
}

const getHistoryList = (history) => {
    return new Promise(function (resolve, reject) {
        let historyList = [];

        history.on("commit", (commit) => {
            getCommitObject(commit)
                .then(commitObject => {
                    historyList.push(commitObject);
                    return Promise.resolve();
                });
        });
        history.on("end", () => resolve(historyList));
        history.on("error", error => reject(error));
        history.start();
    });
}

const getCommitObject = (commit) => {

    return new Promise((resolve, reject) => {
        let commitObject = {
            id: commit.sha(),
            authorName: commit.author().name(),
            athorEmail: commit.author().email(),
            createdOn: commit.date(),
            message: commit.message(),
            oId: commit.id().toString(),
            files: {
                added: [],
                removed: [],
                modified: []
            },
            lines: {
                added: 0,
                removed: 0,
                modified: 0
            },
            approvedBy: []
        };

        // Get Approvers
        let message = commit.message();
        messageSplit = message.split('\n');
        messageSplit.forEach((splitMessage) => {
            if (splitMessage.indexOf('Approved-by: ') > -1) {
                let messageApprover = splitMessage;
                messageApproverSplit = messageApprover.split(': ');

                commitObject.approvedBy.push({
                    authorName: messageApproverSplit[1].split(' <')[0],
                    athorEmail: (messageApproverSplit[1].split(' <')[1] && messageApproverSplit[1].split(' <')[1].split('>')[0]) || ''
                });
            }
        });

        message = messageSplit.join(' ');
        messageSplit = message.split('Approved-by: ');
        message = messageSplit[0];
        commitObject.message = message;

        // Get Files and Lines Changes
        let patchList = [];
        return Promise.resolve()
            .then(() => {
                return commit.getDiff();
            })
            .then((diffList) => {
                let patchesPromiseArray = [];
                diffList.forEach((diff) => {
                    patchesPromiseArray.push(diff.patches());
                });
                return Promise.all(patchesPromiseArray);
            })
            .then((result) => {
                let hunksPromiseArray = [];
                result.forEach((patches) => {
                    patches.forEach((patch) => {
                        patchList.push({
                            oldFilePath: patch.oldFile().path(),
                            newFilePath: patch.newFile().path()
                        });
                        hunksPromiseArray.push(patch.hunks());
                    });
                });
                return Promise.all(hunksPromiseArray);
            })
            .then((result) => {
                let linesPromiseArray = [];
                result.forEach((hunks, index) => {
                    hunks.forEach((hunk) => {
                        let hunkHeader = hunk.header().trim();
                        hunkHeader = hunkHeader.split(' ');

                        // Check files change
                        if (hunkHeader[1] === '-0,0') {
                            let filePath = patchList[index].newFilePath;
                            let filePathSplit = filePath.split('/');
                            let fileName = filePathSplit[filePathSplit.length - 1];
                            commitObject.files.added.push({
                                fileName,
                                filePath
                            });
                        }
                        else if (hunkHeader[2] === '+0,0') {
                            let filePath = patchList[index].oldFilePath;
                            let filePathSplit = filePath.split('/');
                            let fileName = filePathSplit[filePathSplit.length - 1];
                            commitObject.files.removed.push({
                                fileName,
                                filePath
                            });
                        }
                        else {
                            let filePath = patchList[index].newFilePath;
                            let filePathSplit = filePath.split('/');
                            let fileName = filePathSplit[filePathSplit.length - 1];
                            commitObject.files.modified.push({
                                fileName,
                                filePath
                            });
                        }

                        // Check lines change
                        let previousVersionLinesCount = Number(hunkHeader[1].split(',')[1]);
                        let newVersionLinesCount = Number(hunkHeader[2].split(',')[1]);

                        if (newVersionLinesCount > previousVersionLinesCount) {
                            commitObject.lines.added += Math.abs(newVersionLinesCount - previousVersionLinesCount)
                        }

                        if (newVersionLinesCount < previousVersionLinesCount) {
                            commitObject.lines.removed += Math.abs(newVersionLinesCount - previousVersionLinesCount)
                        }

                        commitObject.files.added = _.uniq(commitObject.files.added);
                        commitObject.files.modified = _.uniq(commitObject.files.modified);
                        commitObject.files.removed = _.uniq(commitObject.files.removed);

                        linesPromiseArray.push(hunk.lines());
                    });
                });
                return Promise.all(linesPromiseArray);
            })
            .then((result) => {
                let linesListLength = 0;
                result.forEach((lines) => {
                    linesListLength += lines.length;
                });
                commitObject.lines.modified = linesListLength;
                return resolve(commitObject);
            })
            .error((error) => reject(error));
    });
}

module.exports = GitRepo;