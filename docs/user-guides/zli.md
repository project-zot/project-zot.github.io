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

You can list all images hosted on a zot server using the [`zli images`](#_zli-images) command with the server’s alias:

    $ bin/zli images remote-zot

    IMAGE NAME        TAG               DIGEST    SIZE
    postgres          9.6.18-alpine     ef27f3e1  14.4MB
    postgres          9.5-alpine        264450a7  14.4MB
    busybox           latest            414aeb86  707.8KB

You can also filter the image list to view a specific image by specifying the image name:

    $ bin/zli images remote-zot -n busybox

    IMAGE NAME        TAG               DIGEST    SIZE
    busybox           latest            414aeb86  707.8KB

### Scanning images for known vulnerabilities

Using the [`zli cve`](#_zli-cve) command, you can fetch the CVE (Common Vulnerabilities and Exposures) information for images hosted on the zot server. This example shows how to learn which images are affected by a specific CVE:

    $ bin/zli cve remote-zot -i CVE-2017-9935

    IMAGE NAME        TAG               DIGEST    SIZE
    c3/openjdk-dev    commit-5be4d92    ac3762e2  335MB

This example displays a list all CVEs affecting a specific image:

    $ bin/zli cve remote-zot -I c3/openjdk-dev:0.3.19

    ID                SEVERITY  TITLE
    CVE-2015-8540     LOW       libpng: underflow read in png_check_keyword()
    CVE-2017-16826    LOW       binutils: Invalid memory access in the coff_s...

This example displays the detailed CVEs in JSON format:

    $ bin/zli cve remote-zot -I c3/openjdk-dev:0.3.19 -o json
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

    $ bin/zli cve remote-zot -I c3/openjdk-dev -i CVE-2017-9935

    IMAGE NAME        TAG               DIGEST    SIZE
    c3/openjdk-dev    commit-2674e8a    71046748  338MB
    c3/openjdk-dev    commit-bd5cc94    0ab7fc76

This example lists all images on a specific zot server where the CVE has been fixed:

    $ bin/zli cve remote-zot -I c3/openjdk-dev -i CVE-2017-9935 --fixed

    IMAGE NAME        TAG                       DIGEST    SIZE
    c3/openjdk-dev    commit-2674e8a-squashfs   b545b8ba  321MB
    c3/openjdk-dev    commit-d5024ec-squashfs   cd45f8cf  321MB

### Listing repositories

You can list all repositories hosted on a zot server using the [`zli repos`](#_zli-repos) command with the server’s alias:

    Searching... 🌍

    REPOSITORY NAME
    alpine
    busybox

### Searching for repositories and images

You can locate repositories and images hosted on a zot server using the [`zli search`](#_zli-search) command.

- To search for a repository, specify the full name with a colon or a partial name with no colon.
- To search for an image, specify the full repository name followed by the tag or a prefix of the tag.

This example searches the zot registry named 'local' for a repository whose name contains the substring 'ng':

    $ bin/zli search --query ng local

    NAME            SIZE        LAST UPDATED                             DOWNLOADS   STARS
    nginx           794MB       2023-03-01 18:44:17.707690369 +0000 UTC  0           0
    mongo           232MB       2022-10-18 15:03:40.7646203 +0300 +0300  0           0
    golang          1.1GB       2023-06-22 00:32:38.613354854 +0000 UTC  0           0

This example searches the zot registry named 'local' for a repository named 'nginx'. Because the repository name is followed by a colon, the search results must match the name exactly. 

    $ bin/zli search --query nginx: local

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


<a name="_zli-command-reference"></a>

## Command reference

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
      images      List images hosted on the zot registry
      repos       List all repositories
      search      Search images and their tags

    Flags:
      -h, --help      help for zli
      -v, --version   show the version and exit

    Use "zli [command] --help" for more information about a command.

<a name="_zli-completion"></a>

### zli completion

This command generates the autocompletion script for `zli` for the specified shell. See each sub-command’s help for details on how to use the generated script.

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

This command modifies and lists modified settings for a running zot registry.

    $ bin/zli config --help

    Configure zot registry parameters for CLI

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
      url           zot server URL
      showspinner   show spinner while loading data [true/false]
      verify-tls    enable TLS certificate verification of the server [default: true]

<a name="_zli-cve"></a>

### zli cve

This command lists CVEs (Common Vulnerabilities and Exposures) of images hosted on the zot registry

    $ ./zli cve --help

    Usage:
      zli cve [config-name] [flags]

    Flags:
      -i, --cve-id string   List images affected by a CVE
          --debug           Show debug output
          --fixed           List tags which have fixed a CVE
      -h, --help            help for cve
      -I, --image string    List CVEs by IMAGENAME[:TAG]
      -o, --output string   Specify output format [text/json/yaml]. JSON and YAML format return all info for CVEs
      -s, --search string   Search specific CVEs by name/id
          --url string      Specify zot server URL if config-name is not mentioned
      -u, --user string     User Credentials of zot server in USERNAME:PASSWORD format

<a name="_zli-images"></a>

### zli images

This command lists images hosted on the zot registry.

    $ ./zli images --help

    Usage:
      zli images [config-name] [flags]

    Flags:
      -b, --base-images string      List images that are base for the given image
          --debug                   Show debug output
      -D, --derived-images string   List images that are derived from given image
      -d, --digest string   List images containing a specific manifest, config, or layer digest
      -h, --help            help for images
      -n, --name string     List image details by name
      -o, --output string   Specify output format [text/json/yaml]
          --url string      Specify zot server URL if config-name is not mentioned
      -u, --user string     User Credentials of zot server in "username:password" format
          --verbose         Show verbose output

    Run 'zli config -h' for details on [config-name] argument

<a name="_zli-repos"></a>

### zli repos

This command lists all repositories in the zot registry.

    $ ./zli repos --help

    Usage:
      zli repos [config-name] [flags]

    Flags:
          --debug         Show debug output
      -h, --help          help for repos
          --url string    Specify zot server URL if config-name is not mentioned
      -u, --user string   User Credentials of zot server in "username:password" format

    Run 'zli config -h' for details on [config-name] argument

<a name="_zli-search"></a>

### zli search

The `search` command allows smart searching for a repository by its name or for an image by its repo:tag.

[comment]: <> (zli search --help )

    $ ./zli search --help

    Search repos or images
    Example:
      # For repo search specify a substring of the repo name without the tag
      zli search --query test/repo

      # For image search specify the full repo name followed by the tag or a prefix of the tag
      zli search --query test/repo:2.1.

      # For referrers search specify the referred subject using its full digest or tag
      zli search --subject repo@sha256:f9a0981...
      zli search --subject repo:tag

    Usage:
      zli search [config-name] [flags]

    Flags:
          --debug            Show debug output
      -h, --help             help for search
      -o, --output string    Specify output format [text/json/yaml]
      -q, --query string     Specify what repo or image (repo:tag) to be searched
      -s, --subject string   List all referrers for this subject. The subject can be specified by tag (repo:tag) or by digest (repo@digest)
          --url string       Specify zot server URL if config-name is not mentioned
      -u, --user string      User Credentials of zot server in "username:password" format
          --verbose          Show verbose output

    Run 'zli config -h' for details on [config-name] argument