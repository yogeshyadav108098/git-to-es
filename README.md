# Git Info To ES
> Bash command and node library to push git info to ES for better visualization.

## Preface ##
In normal scenarios, its difficult to analyze git data, this command and library aims to make it easily as it pushes the data to es where dashboards can be created easily.

## Features ##
1. Push commits to Es.
2. Push Tags to Es.
3. Works as both command line or as a node library.

## Beautify your git Info ##

### Create dashboards: ###
![Dashboard-1](assets/dashboard-1.png?raw=true "Dashboard-1")

### Discover: ###
![Discover-1](assets/discover-1.png?raw=true "Discover-1")

## Getting started. ##
GitToEs will work on all systems which can run node or have bash instalked.

## Command Line Usage

``` bash
npm install -g git-to-es
```

### Usage ###
```bash
Usage: git-to-es [options] [command]
```

Options:

```bash
-v, --version              output the version number
-h, --help                 output usage information
```

Commands:

```bash
push [options] <all>       Push info to ES
*                          Unsupported command
```
### Examples. ###

#### Push commits: ####

```bash
git-to-es push all --hosts 127.0.0.1:9200 --repoName git --origin local --workingDirPath /Users/yogesh.yadav/Downloads/PersonalSpace/Work/Code/CSR/git-to-es --infoType commits
```

#### Push tags: ####

```bash
git-to-es push all --hosts 127.0.0.1:9200 --repoName git --origin local --workingDirPath /Users/yogesh.yadav/Downloads/PersonalSpace/Work/Code/CSR/git-to-es --infoType tags
```

## Node Library Usage

``` bash
npm install --save git-to-es
```

### Examples. ###

#### Push commits: ####

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

#### Push tags: ####

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


## Have a problem? Come chat with us! ##

[LinkedIn](https://www.linkedin.com/in/yogeshyadav108098)<br />
[Twitter](https://twitter.com/Yogeshyadav098)<br />
[Github](https://github.com/yogeshyadav108098)<br />
[Gmail](<mailto:yogeshyadav108098@gmail.com>)

## Maintained by ##
[Yogesh Yadav](https://www.linkedin.com/in/yogeshyadav108098/)

## Support my projects

I open-source almost everything I can, and I try to reply everyone needing help using these projects. Obviously,
this takes time. You can integrate and use these projects in your applications *for free*! You can even change the source code and redistribute (even resell it).

However, if you get some profit from this or just want to encourage me to continue creating stuff, there are few ways you can do it:

 - Starring and sharing the projects you like
 - **Paytm** You can make one-time donations via Paytm (+91-7411000282). I'll probably buy a coffee.
 - **UPI** You can make one-time donations via UPI (7411000282@paytm).
 - **Bitcoin** You can send me bitcoins at this address (or scanning the code below): `3BKvX4Rck6B69JZMuPFFCPif4dSctSxJQ5`

Thanks!


## Where is this library used?
If you are using this library in one of your projects, add it here.


## License
MIT © [Yogesh Yadav](https://www.linkedin.com/in/yogeshyadav108098/)

[contributing]: /CONTRIBUTING.md