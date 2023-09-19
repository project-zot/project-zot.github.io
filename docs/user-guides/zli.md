# Using the command line interface (zli)

> :point_right: **zli**: The command line tool for zot servers

## What is zli?

zli is a binary that implements a set of command line commands for interacting with the zot registry server.

> :bulb:
> We recommend installing zli when you install zot.


## How to get zli

zli is hosted with zot on GitHub at [project-zot](https://github.com/project-zot/zot). From GitHub, you can download the zli binary or you can build zli from the source.


<a name="supported-platforms-zli"></a>

### Supported platforms

zli is supported for the following operating systems and platform architectures:

| OS     | ARCH  | Platform                            |
|--------|-------|-------------------------------------|
| linux  | amd64 | Intel-based Linux servers           |
| linux  | arm64 | ARM-based servers and Raspberry Pi4 |
| darwin | amd64 | Intel-based MacOS                   |
| darwin | arm64 | ARM-based MacOS                     |


### Downloading zli binaries

You can download the executable binary for your server platform and architecture under "Assets" on the GitHub [zot releases](https://github.com/project-zot/zot/releases) page.

The binary image is named using the OS and architecture from the [Supported platforms](#supported-platforms-zli) table. For example, the binary for an Intel-based MacOS server is `zli-darwin-amd64.`

### Building zli from source

To build the zli binary, copy or clone the zot project from GitHub and execute the `make cli` command in the `zot` directory. Use the same command options that you used to build zot, as shown:

`make OS=os ARCH=architecture cli`

For example, the following command builds zli for an Intel-based MacOS server:

    make OS=darwin ARCH=amd64 cli

In this example, the resulting executable file is `zli-darwin-amd64` in the `zot/bin` directory.

## Common tasks using zli

This section includes examples of common zot server tasks using the zli command line interface. For a detailed listing of zli commands, see the [zli Command Reference](#_zli-command-reference) in this guide.

> :bulb:
> The original filename of the zli executable file will reflect the build options, such as `zli-linux-amd64`. For convenience, you can rename the executable to simply `zli`. The instructions and examples in this guide use `zli` as the name of the executable file.


### Adding a zot server URL

You can modify the zot server configuration using the [`zli config add`](#_zli-config) command. This example adds a zot server URL with an alias of `remote-zot`:

    $ bin/zli config add remote-zot https://server-example:8080

Use the [`zli config`](#_zli-config) command to list all configured URLs with their aliases:

    $ bin/zli config -l

    remote-zot   https://server-example:8080
    local        http://localhost:8080

### Listing images

You can list all images hosted on a zot server using the [`zli image list`](#_zli-image) command with the server’s alias:

    $ bin/zli image list --config local

    REPOSITORY        TAG       OS/ARCH         DIGEST      SIGNED      SIZE        
    alpine            latest    linux/amd64     3fc10231    false       84MB        
    busybox           latest    linux/amd64     9172c5f6    false       2.2MB 

You can also filter the image list to view a specific image by specifying the image name:

    $ bin/zli image name busybox:latest --config local

    REPOSITORY        TAG       OS/ARCH         DIGEST      SIGNED      SIZE              
    busybox           latest    linux/amd64     9172c5f6    false       2.2MB 

### Scanning images for known vulnerabilities

Using the [`zli cve list`](#_zli-cve) command, you can fetch the CVE (Common Vulnerabilities and Exposures) information for images hosted on the zot server. This example shows how to learn which images are affected by a specific CVE:

    $ bin/zli cve affected CVE-2017-9935 --config remote-zot

    IMAGE NAME        TAG               DIGEST    SIZE
    c3/openjdk-dev    commit-5be4d92    ac3762e2  335MB

This example displays a list of all CVEs affecting a specific image:

    $ bin/zli cve list c3/openjdk-dev:0.3.19 --config remote-zot

    ID                SEVERITY  TITLE
    CVE-2015-8540     LOW       libpng: underflow read in png_check_keyword()
    CVE-2017-16826    LOW       binutils: Invalid memory access in the coff_s...

This example displays the detailed CVEs in JSON format:

    $ bin/zli cve list c3/openjdk-dev:0.3.19 --config remote-zot -f json
    {
      "Tag": "0.3.19",
      "CVEList": [
        {
          "Id": "CVE-2019-17006",
          "Severity": "MEDIUM",
          "Title": "nss: Check length of inputs for cryptographic primitives",
          "Description": "A vulnerability was discovered in nss where input text length was not checked when using certain cryptographic primitives. This could lead to a heap-buffer overflow resulting in a crash and data leak. The highest threat is to confidentiality and integrity of data as well as system availability.",
          "PackageList": [
            {
              "Name": "nss",
              "InstalledVersion": "3.44.0-7.el7_7",
              "FixedVersion": "Not Specified"
            },
            {
              "Name": "nss-sysinit",
              "InstalledVersion": "3.44.0-7.el7_7",
              "FixedVersion": "Not Specified"
            },
            {
              "Name": "nss-tools",
              "InstalledVersion": "3.44.0-7.el7_7",
              "FixedVersion": "Not Specified"
            }]
        }]
    }

This example lists all images on a specific zot server that are affected by a specific CVE:

    $ bin/zli cve affected --config remote-zot CVE-2017-9935 --repo c3/openjdk-dev

    IMAGE NAME        TAG               DIGEST    SIZE
    c3/openjdk-dev    commit-2674e8a    71046748  338MB
    c3/openjdk-dev    commit-bd5cc94    0ab7fc76

This example lists all images on a specific zot server where the CVE has been fixed:

    $ bin/zli cve fixed c3/openjdk-dev CVE-2017-9935 --config remote-zot

    IMAGE NAME        TAG                       DIGEST    SIZE
    c3/openjdk-dev    commit-2674e8a-squashfs   b545b8ba  321MB
    c3/openjdk-dev    commit-d5024ec-squashfs   cd45f8cf  321MB


### Listing repositories

You can list all repositories hosted on a zot server using the [`zli repo`](#_zli-repo) command with the server’s alias:

    Searching... 🌍

    REPOSITORY NAME
    alpine
    busybox

### Searching for repositories and images

You can locate repositories and images hosted on a zot server using the [`zli search`](#_zli-search) command.

- To search for a repository, specify the full name with a colon or a partial name with no colon.
- To search for an image, specify the full repository name followed by the tag or a prefix of the tag.

This example searches the zot registry named 'local' for a repository whose name contains the substring 'ng':

    $ bin/zli search query ng --config local

    NAME            SIZE        LAST UPDATED                             DOWNLOADS   STARS
    nginx           794MB       2023-03-01 18:44:17.707690369 +0000 UTC  0           0
    mongo           232MB       2022-10-18 15:03:40.7646203 +0300 +0300  0           0
    golang          1.1GB       2023-06-22 00:32:38.613354854 +0000 UTC  0           0

This example searches the zot registry named 'local' for a repository named 'nginx'. Because the repository name is followed by a colon, the search results must match the name exactly. 

    $ bin/zli search query nginx: --config local

    REPOSITORY  TAG          OS/ARCH         DIGEST      SIGNED      SIZE
    nginx       1.23.1       linux/amd64     d2ad9089    true        57MB
    nginx       latest       *               c724afdf    true        448MB
                             linux/amd64     009c6fda    false       57MB
                             linux/arm/v5    1d5d4f53    false       54MB
                             linux/arm/v7    f809744c    false       50MB
                             linux/arm64/v8  ebb807a9    false       56MB
                             linux/386       19cf4b3c    false       59MB
                             linux/mips64le  45ab60e6    false       55MB
                             linux/ppc64le   89511bee    false       63MB
                             linux/s390x     713b9329    false       55MB
    nginx       stable-perl  *               4383a0b8    true        534MB
                             linux/amd64     308a37a0    false       68MB
                             linux/arm/v5    0fb8fb71    false       64MB
                             linux/arm/v7    6868f552    false       60MB
                             linux/arm64/v8  aed72c86    false       66MB
                             linux/386       5c7ed456    false       69MB
                             linux/mips64le  546d2bae    false       65MB
                             linux/ppc64le   7db02f5a    false       74MB
                             linux/s390x     800fd86f    false       66MB


## Sorting the output of a zli command

For a zli command that can result in a lengthy output list, you can use the command flag `--sort-by <option>` to cause the output to be sorted by a specified property of the output data. The available sorting criteria vary for different commands, but examples of  sorting criteria options are described in the following table:

| flag option | criteria |
| -------- | ------ |
| `alpha-asc` | alphabetical, ascending |
| `alpha-dsc` | alphabetical, descending |
| `relevance` | quality of match |
| `severity` | severity of condition |
| `update-time` | timestamp | 

For a given command that results in an output list, you can see the available sorting criteria in the usage information returned by the `--help` flag.  For example, `bin/zli image name --help` returns usage information containing the following line under "Flags":

`--sort-by string   Options for sorting the output: [update-time, alpha-asc, alpha-dsc] (default "alpha-asc")`

According to this information, the list of image names returned by the `bin/zli image name` command can be sorted in order of alphabetical ascending, alphabetical descending, or the timestamp of the latest update of the image. The default sorting method for this command, if no `--sort-by` flag is present, is alphabetical ascending.

<a name="_zli-command-reference"></a>

## Command reference

This section provides detailed usage information for basic first-level zli commands.  Many zli commands also support subcommands, which are listed as "Available Commands" in each command description.  For example, `zli search` can be extended with either the `query` or `subject` subcommand.  To see the detailed usage for each subcommand, type the command with the subcommand and append `--help`, such as `zli search query --help`.  The `zli search` description below includes the subcommand help as an example.

### zli

    $ bin/zli --help

    Usage:
      zli [flags]
      zli [command]

    Available Commands:
      completion  Generate the autocompletion script for the specified shell
      config      Configure zot registry parameters for CLI
      cve         Lookup CVEs in images hosted on the zot registry
      help        Help about any command
      image       List images hosted on the zot registry
      repo        List all repositories
      search      Search images and their tags

    Flags:
      -h, --help      help for zli
      -v, --version   show the version and exit

    Use "zli [command] --help" for more information about a command.

<a name="_zli-completion"></a>

### zli completion

This command generates the autocompletion script for `zli` for the specified shell. See each subcommand’s help for details on how to use the generated script.

    $ bin/zli completion --help

    Usage:
      zli completion [command]

    Available Commands:
      bash        Generate the autocompletion script for bash
      fish        Generate the autocompletion script for fish
      powershell  Generate the autocompletion script for powershell
      zsh         Generate the autocompletion script for zsh

    Flags:
      -h, --help   help for completion

    Use "zli completion [command] --help" for more information about a command.


<a name="_zli-config"></a>

### zli config

This command configures zot registry parameters for CLI.

    $ bin/zli config --help

    Usage:
      zli config <config-name> [variable] [value] [flags]
      zli config [command]

    Examples:
      zli config add main https://zot-foo.com:8080
      zli config --list
      zli config main url
      zli config main --list
      zli config remove main

    Available Commands:
      add         Add configuration for a zot registry
      remove      Remove configuration for a zot registry

    Flags:
      -h, --help    help for config
      -l, --list    List configurations
          --reset   Reset a variable value

    Use "zli config [command] --help" for more information about a command.

    Useful variables:
      url		zot server URL
      showspinner	show spinner while loading data [true/false]
      verify-tls	enable TLS certificate verification of the server [default: true]

<a name="_zli-cve"></a>

### zli cve

This command lists CVEs (Common Vulnerabilities and Exposures) of images hosted on the zot registry

    $ ./zli cve --help

    Usage:
      zli cve [command]

    Available Commands:
      affected    List images affected by a CVE
      fixed       List tags where a CVE is fixedRetryWithContext
      list        List CVEs by REPO:TAG or REPO@DIGEST

    Flags:
          --config string   Specify the registry configuration to use for connection
          --debug           Show debug output
      -f, --format string   Specify output format [text/json/yaml]
      -h, --help            help for cve
          --url string      Specify zot server URL if config-name is not mentioned
      -u, --user string     User Credentials of zot server in "username:password" format
          --verbose         Show verbose output

    Use "zli cve [command] --help" for more information about a command.

    Run 'zli config -h' for details on [config-name] argument

<a name="_zli-image"></a>

### zli image

This command lists images hosted on the zot registry.

    $ ./zli image --help

    Usage:
      zli image [command]

    Available Commands:
      base        List images that are base for the given image
      cve         List all CVE's of the image
      derived     List images that are derived from given image
      digest      List images that contain a blob(manifest, config or layer) with the given digest
      list        List all images
      name        List image details by name

    Flags:
          --config string   Specify the registry configuration to use for connection
          --debug           Show debug output
      -f, --format string   Specify output format [text/json/yaml]
      -h, --help            help for image
          --url string      Specify zot server URL if config-name is not mentioned
      -u, --user string     User Credentials of zot server in "username:password" format
          --verbose         Show verbose output

    Use "zli image [command] --help" for more information about a command.

    Run 'zli config -h' for details on [config-name] argument

<a name="_zli-repo"></a>

### zli repo

This command lists all repositories in the zot registry.

    $ ./zli repo --help

    Usage:
      zli repo [command]

    Available Commands:
      list        List all repositories

    Flags:
          --config string   Specify the registry configuration to use for connection
          --debug           Show debug output
      -h, --help            help for repo
          --url string      Specify zot server URL if config-name is not mentioned
      -u, --user string     User Credentials of zot server in "username:password" format

    Use "zli repo [command] --help" for more information about a command.

    Run 'zli config -h' for details on [config-name] argument

<a name="_zli-search"></a>

### zli search

The `search` command allows smart searching for a repository by its name or for an image by its repo:tag.

[comment]: <> (zli search --help )

    $ ./zli search --help

    Search repos or images

    Usage:
      zli search [command]

    Available Commands:
      query       Fuzzy search for repos and their tags.
      subject     List all referrers for this subject.

    Flags:
          --config string   Specify the registry configuration to use for connection
          --debug           Show debug output
      -f, --format string   Specify output format [text/json/yaml]
      -h, --help            help for search
          --url string      Specify zot server URL if config-name is not mentioned
      -u, --user string     User Credentials of zot server in "username:password" format
          --verbose         Show verbose output

    Use "zli search [command] --help" for more information about a command.

    Run 'zli config -h' for details on [config-name] argument

#### zli search query

    $ ./zli search query --help

    Usage:
      zli search query [repo]|[repo:tag] [flags]

    Examples:
    # For repo search specify a substring of the repo name without the tag
      zli search query "test/repo"
        
    # For image search specify the full repo name followed by the tag or a prefix of the tag.
      zli search query "test/repo:2.1."

    Flags:
      -h, --help             help for query
          --sort-by string   Options for sorting the output: [relevance, update-time, alpha-asc, alpha-dsc] (default "relevance")

    Global Flags:
          --config string   Specify the registry configuration to use for connection
          --debug           Show debug output
      -f, --format string   Specify output format [text/json/yaml]
          --url string      Specify zot server URL if config-name is not mentioned
      -u, --user string     User Credentials of zot server in "username:password" format
          --verbose         Show verbose output

    Run 'zli config -h' for details on [config-name] argument

#### zli search subject

    $ ./zli search subject --help

    List all referrers for this subject. The subject can be specified by tag(repo:tag) or by digest" or (repo@digest)

    Usage:
      zli search subject [repo:tag]|[repo@digest] [flags]

    Examples:
    # For referrers search specify the referred subject using it's full digest or tag:
      zli search subject "repo@sha256:f9a0981..."
      zli search subject "repo:tag"

    Flags:
      -h, --help             help for subject
          --sort-by string   Options for sorting the output: [update-time, alpha-asc, alpha-dsc] (default "alpha-asc")

    Global Flags:
          --config string   Specify the registry configuration to use for connection
          --debug           Show debug output
      -f, --format string   Specify output format [text/json/yaml]
          --url string      Specify zot server URL if config-name is not mentioned
      -u, --user string     User Credentials of zot server in "username:password" format
          --verbose         Show verbose output

    Run 'zli config -h' for details on [config-name] argument
