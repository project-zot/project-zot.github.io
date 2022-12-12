# Zot Developer Guide

## Getting Started

<a name='supported-platforms-zot'></a>

### Supported Developer Platforms

Development is officially supported on `Linux` and `Apple MacOS`
platforms. However, development should be possible on any platform that
supports the `golang` toolchain.

| OS     | ARCH  | Platform                            |
|--------|-------|-------------------------------------|
| linux  | amd64 | Intel-based Linux servers           |
| linux  | arm64 | ARM-based servers and Raspberry Pi4 |
| darwin | amd64 | Intel-based MacOS                   |
| darwin | arm64 | ARM-based MacOS (Apple M1)          |

Supported platforms and architectures

### Prerequisites

#### Install golang (1.19+)

The zot project requires `golang 1.19` or newer. You can follow [these instructions](https://go.dev/learn/) to install the `golang` toolchain.
After installation, make sure that the `path` environment variable or
your IDE can find the toolchain.

### Cloning zot

The zot registry code base is hosted on GitHub at
<https://github.com/project-zot/zot>.

To clone the zot project, use this command:

    $ git clone https://github.com/project-zot/zot.git

### Building zot

To build zot, execute the `make` command in the zot directory using the
following general syntax:

`$ make OS=os ARCH=architecture {binary | binary-minimal}`



-   The operating system and architecture options are listed in the
    [Supported platforms and architectures](#supported-platforms-zot)
    table. If an option is not specified, the defaults are `linux` and
    `amd64`.

-   The `binary` option builds the full zot binary image with all
    extensions.

-   The `binary-minimal` option builds the minimal distribution-spec
    conformant zot binary image without extensions, reducing the attack
    surface.



For example, to build a zot image with extensions for an Intel-based
linux server, use the following command:

    make OS=linux ARCH=amd64 binary

The `make` command builds an executable image in the `zot/bin`
directory. The original filename of the zot executable image will
indicate the build options. For example, the filename of an Intel-based
linux minimal image is `zot-linux-amd64-minimal`.

### Running zot

The behavior of zot is controlled via configuration only. To launch the
zot server, execute the following command:

    $  bin/zot-linux-amd64 serve examples/config-example.json

## Debugging zot

To produce a zot binary that includes extensive debugging information,
build zot with the `binary-debug` option, as shown in this example:

    make OS=linux ARCH=amd64 binary-debug

You can then attach and run a debugging tool such as Delve to the
running zot process.

Delve is a powerful open-source debugger for the Go programming
language. Downloads and documentation for Delve are available on GitHub
at <https://github.com/go-delve/delve>.

## Code Organization

The `zot` project codebase is organized as follows:

    /
    - pkg/              # Source code for all libraries
      - api/            # Source code for HTTP APIs
        - config/       # Global configuration model
      - storage/        # Source code for storage backends
      - cli/            # Source code for command line interface (cli)
      - common/         # Source code for common utility routines
      - compliance/     # Source code for dist-spec conformance tests
      - log/            # Source code for logging framework
      - test/           # Internal test scripts/data
      - extensions/     # Source code for all extensions
        - config/
        - sync/
        - monitoring/
        - sync/
      - exporter/       # Source code for metrics exporter
    - cmd/              # Source code for binary main()s
      - zot/            # Source code for zot binary
      - zli/            # Source code for zot cli
      - zb/             # Source code for zb, the dist-spec benchmarking tool
    - errors/           # Source code for error codes
    - examples/         # Configuration examples
    - swagger/          # Swagger integration
    - docs/             # Documentation

## Contributor Guidelines

### License

zot is released under the [Apache License
2.0](https://github.com/project-zot/zot/blob/main/LICENSE). All
contributions must adhere to this license.

### Developer Certificate of Origin (DCO)

All commits require a Developer Certificate of Origin via the
"Signed-off-by:" commit message and commit signatures using GPG keys.

### Submitting a Pull Request (PR)

First, fork the zot project on GitHub and submit a commit to your fork.
Then open a new pull request (PR) to the zot project.

### PR Requirements

Any new PR requires a form to be filled out with details about the PR.
Appropriate code owners are automatically identified, and they will be
notified of the new PR.

### CI/CD Checks

We take code quality very very seriously. All PRs must pass various
CI/CD checks which cover enforce code quality such as code coverage,
security scanning, performance regressions, distribution spec
conformance, ecosystem client tool compatibility, etc.

## Reporting Issues

Issues are broadly classified as functional bugs and security issues.
The latter is treated a little differently due to the sensitive nature.

### Filing an Issue

No software is perfect, and we expect users to find issues with the zot
code base. First, check whether your issue has already been filed by
someone else by doing an [issue
search](https://github.com/project-zot/zot/issues). If the issue not
found, file a new issue by clicking the **New issue** button on the
**zot/issues** page and answering the questions. The more information
that you can provide, the easier it becomes to triage the issue.

### Security Issues

Security issues are best filed by sending an email to
`security@zotregistry.io.` After 45 days, we will make the issue public
and give credit to the original filer of the issue.

## Code of Conduct

The zot project follows the [CNCF Code of
Conduct](https://github.com/cncf/foundation/blob/main/code-of-conduct.md).

### Reporting

For incidents occurring on the zot project, contact the zot project
conduct committee by sending an email to `conduct@zotregistry.io.` You can expect a response
within three business days.
