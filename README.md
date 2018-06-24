# Git Info To ES

> Node library to push git info to ES for better visualization.

<table>
    <thead>
        <tr>
            <th>Linux</th>
            <th>OS X</th>
            <th>Windows</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" align="center">Passed</td>
            <td align="center">Passed</td>
        </tr>
    </tbody>
</table>


## Beautify your git Info ##

### Create dashboards: ###
![Dashboard-1](assets/dashboard-1.png?raw=true "Dashboard-1")

### Discover: ###
![Discover-1](assets/discover-1.png?raw=true "Discover-1")


## Have a problem? Come chat with us! ##

[LinkedIn](https://www.linkedin.com/in/yogeshyadav108098)<br />
[Twitter](https://twitter.com/Yogeshyadav098)<br />
[Github](https://github.com/yogeshyadav108098)<br />
[Gmail](<mailto:yogeshyadav108098@gmail.com>)

## Maintained by ##
[Yogesh Yadav](https://www.linkedin.com/in/yogeshyadav108098/)

## Getting started. ##

GitToEs will work on all systems.

``` bash
npm install git-to-es
```

## API examples. ##

### Push commits: ###

``` javascript
const GitToEs = require("git-to-es");
const Elasticsearch = require('elasticsearch');
let client = new Elasticsearch.Client({
    host: {
        host: '127.0.0.1',
        port: 9200
    }
});

let gitToEs = new GitToEs({
    es: {
        client: client,
        index: 'index',
        type: 'type'
    },
    origin: 'local',
    workingDirPath: '/Users/yogesh.yadav/repo-name'
})

gitToEs.init()
    .then(() => gitToEs.pushCommits())
    .then(Promise.resolve)
    .error(error => Promise.reject(error));

```

### Push tags: ###

``` javascript
const GitToEs = require("git-to-es");
const Elasticsearch = require('elasticsearch');
let client = new Elasticsearch.Client({
    host: {
        host: '127.0.0.1',
        port: 9200
    }
});

let gitToEs = new GitToEs({
    es: {
        client: client,
        index: 'index',
        type: 'type'
    },
    origin: 'local',
    workingDirPath: '/Users/yogesh.yadav/repo-name'
})

gitToEs.init()
    .then(() => gitToEs.pushTags())
    .then(Promise.resolve)
    .error(error => Promise.reject(error));

```
