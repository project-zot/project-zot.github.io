# Using the command line interface (zli)

> :point_right: **zli**: The command line tool for zot servers
> 
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

    bin/zli config add remote-zot https://server-example:8080

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

    Usage:
      zli config <config-name> [variable] [value] [flags]
      zli config [command]

    Examples:
      zli config add main https://zot-foo.com:8080
      zli config main url
      zli config main --list
      zli config --list

    Available Commands:
      add         Add configuration for a zot registry

    Flags:
      -h, --help    help for config
      -l, --list    List configurations
          --reset   Reset a variable value

    Use "zli config [command] --help" for more information about a command.

    Useful variables:
      url       zot server URL
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
          --fixed           List tags which have fixed a CVE
      -h, --help            help for cve
      -I, --image string    List CVEs by IMAGENAME[:TAG]
      -o, --output string   Specify output format [text/json/yaml]. JSON and YAML format return all info for CVEs
          --url string      Specify zot server URL if config-name is not mentioned
      -u, --user string     User Credentials of zot server in USERNAME:PASSWORD format

<a name="_zli-images"></a>

### zli images

This command lists images hosted on the zot registry.

    $ ./zli images --help

    Usage:
      zli images [config-name] [flags]

    Flags:
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
      -h, --help          help for repos
          --url string    Specify zot server URL if config-name is not mentioned
      -u, --user string   User Credentials of zot server in "username:password" format

    Run 'zli config -h' for details on [config-name] argument
