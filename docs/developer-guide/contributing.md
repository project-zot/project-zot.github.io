# Contributing to zot Development

> :point_right: The zot project is built for developers by developers. The zot project welcomes the participation of the open source community in extending and improving zot. 

## Submission Requirements

> Summary: All contributions must meet these requirements:
> 
> - Adhere to the Apache license
> - Be submitted by a pull request (PR) from your fork
> - Commits must have a 
> 
### License

zot is released under the [Apache License 2.0](https://github.com/project-zot/zot/blob/main/LICENSE). All contributions must adhere to this license and must explicitly state adherence.

### Submitting a Pull Request (PR)

First, fork the zot project on GitHub and submit a commit to your fork. Then open a new pull request (PR) to the zot project. All pull requests must meet these requirements:

- License statement

  Either the commit message or the PR description must contain the following statement:

  "By submitting this pull request, I confirm that my contribution is made under the terms of the Apache 2.0 license."

- Developer Certificate of Origin (DCO) and sign-off
  
  All commits require a Developer Certificate of Origin via the "Signed-off-by:" commit message and commit signatures using GPG keys. Include the `-s` flag in your `git commit` command.

- Commit message format

  The commit message must follow the [Convention Commits](https://www.conventionalcommits.org/) format. The message must begin with a keyword that categorizes the commit, followed by a colon. Validation of a commit message is determined by this expression:
  
  `"^((build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\(.+\))?(!)?(: (.*\s*)*))" `

  An example of a valid commit message is "docs: Fixes a typo in module.md."

In addition, any new PR requires a brief form to be completed by the submitter with details about the PR. Appropriate code owners are automatically identified and will be notified of the new PR.

### CI/CD Checks

We take code quality very seriously. All PRs must pass various CI/CD checks that enforce code quality such as code coverage, security scanning, performance regressions, distribution spec conformance, ecosystem client tool compatibility, etc.

## Reporting Issues

Issues are broadly classified as functional bugs and security issues. The latter is treated a little differently due to the sensitive nature.

### Filing a Functional Issue

No software is perfect, and we expect users to find issues with the zot code base. First, check whether your issue has already been filed by someone else by performing  an [issue search](https://github.com/project-zot/zot/issues). If the issue is not found, file a new issue by clicking the **New issue** button on the **zot/issues** page and answering the questions. The more information that you can provide, the easier it becomes to triage the issue.

### Filing a Security Issue

Security issues are best filed by sending an email to `security@zotregistry.dev.` After 45 days, we will make the issue public and give credit to the original filer of the issue.

## Code of Conduct

The zot project follows the [CNCF Code of Conduct](https://github.com/cncf/foundation/blob/main/code-of-conduct.md).

### Reporting Conduct Incidents

To report a conduct-related incident occurring on the zot project, contact the zot project conduct committee by sending an email to `conduct@zotregistry.dev.` You can expect a response within three business days.
