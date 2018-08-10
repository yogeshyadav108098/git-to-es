#!/usr/bin/env node
'use strict';

const Chalk = require('chalk');
const Program = require('commander');

const Commands = require('./commands/index.js');

Program
    .command('push')
    .description('Push info to ES')
    .option("-h, --hosts <hosts>", "Es hosts List (127.0.0.1:9200,127.0.0.1:9300)")
    .option("-r, --repoName <repoName>", "Repo Name")
    .option("-o, --origin <origin>", "Origin type (local/remote)")
    .option("-w, --workingDirPath <workingDirPath>", "Working directory path")
    .option("-i, --infoType <infoType>", "Info to push to es")

    .action(Commands.push.exec.bind(Commands.push));

Program
    .command('*')
    .description('Unsupported command')
    .action(() => {
        console.log(
            Chalk.bold.red(
                'Invalid command: ' + Program.args.slice(0, Program.args.length - 1).join(' ') +
                '\nSee --help for a list of available commands.'
            )
        );
        process.exit(0);
    });

Program
    .version('1.0.1', '-v, --version')
    .description('Git Info To ES')
    .parse(process.argv);