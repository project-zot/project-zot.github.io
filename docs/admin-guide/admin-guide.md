# zot Administrator Guide

Revised: 2022-08-09

## Getting started

### How to get `zot`

The `zot` project is hosted on GitHub at
[project-zot](https://github.com/project-zot/zot). From GitHub, you can
download `zot` executable binary images or full source code.

<a name="supported-platforms-zot"></a>

#### Supported platforms

`zot` is officially supported on Linux and Apple MacOS
platforms, using Intel or ARM processors. However, development should be
possible on any platform that supports the `golang` toolchain.

| OS     | ARCH  | Platform                            |
|--------|-------|-------------------------------------|
| linux  | amd64 | Intel-based Linux servers           |
| linux  | arm64 | ARM-based servers and Raspberry Pi4 |
| darwin | amd64 | Intel-based MacOS                   |
| darwin | arm64 | ARM-based MacOS                     |


#### About binary images

Executable binary zot images are available for multiple platforms and
architectures and with full or minimal implementations.

Refer to [*Released Artifacts for zot*](../general/artifacts.md) for
information about available zot images along with information about
image variations, image locations, and image naming formats.

#### Deployment methods

Several options exist for deploying `zot`:

-   You can launch a `zot` binary as a container service using
    a container management tool such as Podman, Docker, or Helm.

-   You can launch `zot` as a host-level service by downloading
    a binary image and running it as a systemd service.

-   You can copy or clone the full `zot` source code and build
    an image with custom build flags.

### Deploying a `zot` binary image

Executable binary images for supported server platforms and
architectures are available from the [zot package
repository](https://github.com/orgs/project-zot/packages?repo_name=zot)
in GitHub.

You can download the appropriate binary image and run it directly on
your server, or you can use a container management tool such as Podman,
runc, Helm, or Docker to fetch and deploy the image in a container on
your server.

> **Tip:** For convenience, you can rename the binary image file to simply `zot.`


#### Example: Deploying with a container manager

Using a container manager such as Podman, runc, Helm, or Docker, you can
install a `zot` binary image, as in the following examples.

**Using Podman**

    podman run -p 5000:5000 ghcr.io/project-zot/zot-linux-amd64:latest

    podman run -p 5000:5000 ghcr.io/project-zot/zot-linux-amd64-minimal:latest

**Using Docker**

    docker run -p 5000:5000 ghcr.io/project-zot/zot-linux-amd64:latest

Each of these example commands pulls a `zot` binary image from
the GitHub Container Registry (ghcr.io) and launches a `zot`
image registry at <http://localhost:5000>.

### Building `zot` from source

#### Prerequisites

##### Install golang (1.17+)

The zot project requires `golang 1.17` or newer. You can follow [these
instructions](https://go.dev/learn/) to install the `golang` toolchain.
After installation, make sure that the `path` environment variable or
your IDE can find the toolchain.

#### Building an executable binary from source

Download or clone the full `zot` project from GitHub at
[project-zot](https://github.com/project-zot/zot). To clone the
`zot` project from GitHub, use this command:

    git clone https://github.com/project-zot/zot.git

To build `zot`, execute the `make` command in the
`zot` directory using the following general syntax:

`make OS=os ARCH=architecture {binary | binary-minimal}`


> -   The operating system and architecture options are listed in the
    [Supported platforms and
    architectures](#supported-platforms-zot)
    table. If an option is not specified, the defaults are `linux` and
    `amd64`.
>
> -   The `binary` option builds the full `zot` binary image with
    all extensions.
>
> -   The `binary-minimal` option builds the minimal distribution-spec
    conformant `zot` binary image without extensions, reducing
    the attack surface.


For example, to build a `zot` image with extensions for an
Intel-based linux server, use the following command:

    make OS=linux ARCH=amd64 binary

The `make` command builds an executable image in the `zot/bin`
directory. The original filename of the `zot` executable image
will indicate the build options. For example, the filename of an
Intel-based linux minimal image is `zot-linux-amd64-minimal`.

> **Tip:**
> For convenience, you can rename the binary image file to simply `zot`.


#### Building a `zot` container image from source

**with Stacker**


Using the settings in stacker.yaml, you can build a container image that
runs the latest `zot` by running the following command:

    make binary-stacker

**with Docker**


A sample Dockerfile is provided on the [zot project
page](https://github.com/project-zot/zot/tree/main/build/Dockerfile) in
GitHub. You can edit the sample file with your specific values, such as
the desired operating system, hardware architecture, and full or minimal
build, as in this example:

    ARG OS=linux
    ARG ARCH=amd64

    RUN make COMMIT=$COMMIT OS=$OS ARCH=$ARCH clean binary-minimal

Using your edited Dockerfile, you can build a container image that runs
the latest `zot` by running the following command:

    make image

#### Deploying the container image

Deploy the image using your container manager, such as Podman, runc,
Helm, or Docker, as in these examples:

**with Podman**

    podman run --rm -it -p 5000:5000 -v $(pwd)/registry:/var/lib/registry zot:latest

**with Docker**

    docker run --rm -it -p 5000:5000 -v $(pwd)/registry:/var/lib/registry zot:latest

A container image built with the sample Dockerfile and deployed with the
example command results in a running registry at
`http://localhost:5000`. Registry content is stored at `.registry`,
which is bind mounted to `/var/lib/registry` in the container. By
default, auth is disabled. As part of the build, a YAML configuration
file is created at `/etc/zot/config.yml` in the container.

You can override the configuration file with custom configuration
settings in the deployment command and in a local configuration file as
shown in this example:

    podman run --rm -p 8080:8080 \
      -v $(pwd)/custom-config.yml:/etc/zot/config.yml \
      -v $(pwd)/registry:/tmp/zot \
      zot:latest

This command causes the registry to listen on port 8080 and to use
`/tmp/zot` for content storage.

### Additional recommended steps

We recommend that, when deploying `zot`, you also install the command line ([zli](#_zli_chapter)) and benchmarking ([zb](#_zb_chapter)) packages.

### Launching `zot`

> **Note:**
> For convenience, you can rename the binary image file to simply `zot`.The instructions and examples in this guide use `zot` as the name of the `zot` executable file and do not include the path to the executable file.


The `zot` service is initiated with the `zot serve` command followed by the name of a configuration file.

The configuration file is a JSON or YAML file that contains all
configuration settings for `zot` functions. Using the
information in this guide, you can compose a configuration file with the
settings and features you require for your `zot` registry
server.

> **Tip:**
> For convenience, you can rename the binary image file to simply `zot`.Before launching `zot`, you can check your configuration file for errors or conflicts using the procedure described in [Verifying the configuration file](#verifying-config).


When ready, you can launch `zot` using the following command:

`zot serve configfile`

<a name="_zli_chapter"></a>

## Using the command line interface (zli)

### What is zli?

zli is a binary that implements a set of command line commands for
interacting with the zot registry server.

> **Tip:**
> We recommend installing zli when you install `zot`.


### How to get zli

zli is hosted with `zot` on GitHub at
[project-zot](https://github.com/project-zot/zot). From GitHub, you can
download the zli binary or you can build zli from the source.


<a name="supported-platforms-zli"></a>

#### Supported platforms

zli is supported for the following operating systems and platform
architectures:

| OS     | ARCH  | Platform                            |
|--------|-------|-------------------------------------|
| linux  | amd64 | Intel-based Linux servers           |
| linux  | arm64 | ARM-based servers and Raspberry Pi4 |
| darwin | amd64 | Intel-based MacOS                   |
| darwin | arm64 | ARM-based MacOS                     |


#### Downloading zli binaries

You can download the executable binary for your server platform and
architecture under "Assets" on the GitHub [zot
releases](https://github.com/project-zot/zot/releases) page.

The binary image is named using the OS and architecture from the
[Supported platforms](#supported-platforms-zli) table.
For example, the binary for an Intel-based MacOS server is
`zli-darwin-amd64.`

#### Building zli from source

To build the zli binary, copy or clone the `zot` project from
GitHub and execute the `make cli` command in the `zot` directory. Use
the same command options that you used to build zot, as shown:

`make OS=os ARCH=architecture cli`

For example, the following command builds zli for an Intel-based MacOS
server:

    make OS=darwin ARCH=amd64 cli

In this example, the resulting executable file is `zli-darwin-amd64` in
the `zot/bin` directory.

### Common tasks using zli

This section includes examples of common zot server tasks using the zli
command line interface. For a detailed listing of zli commands, see the
[zli Command Reference](#_zli-command-reference) in this guide.

> **Tip:**
> For convenience, you can rename the binary image file to simply `zot`.The instructions and examples in this guide use `zli` as the name of the executable file.
>
> The original filename of the executable file will reflect the build options, such as `zli-linux-amd64`. For convenience, you can rename the executable to simply `zli`.



#### Adding a zot server URL

You can modify the zot server configuration using the
[`zli config add`](#_zli-config) command. This example adds a zot server
URL with an alias of `remote-zot`:

    bin/zli config add remote-zot https://server-example:8080

Use the [`zli config`](#_zli-config) command to list all configured URLs
with their aliases:

    $ bin/zli config -l

    remote-zot   https://server-example:8080
    local        http://localhost:8080

#### Listing images

You can list all images hosted on a zot server using the
[`zli images`](#_zli-images) command with the server’s alias:

    $ bin/zli images remote-zot

    IMAGE NAME        TAG               DIGEST    SIZE
    postgres          9.6.18-alpine     ef27f3e1  14.4MB
    postgres          9.5-alpine        264450a7  14.4MB
    busybox           latest            414aeb86  707.8KB

You can also filter the image list to view a specific image by
specifying the image name:

    $ bin/zli images remote-zot -n busybox

    IMAGE NAME        TAG               DIGEST    SIZE
    busybox           latest            414aeb86  707.8KB

#### Scanning images for known vulnerabilities

Using the [`zli cve`](#_zli-cve) command, you can fetch the CVE (Common
Vulnerabilities and Exposures) information for images hosted on the zot
server. This example shows how to learn which images are affected by a
specific CVE:

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

This example lists all images on a specific zot server that are affected
by a specific CVE:

    $ bin/zli cve remote-zot -I c3/openjdk-dev -i CVE-2017-9935

    IMAGE NAME        TAG               DIGEST    SIZE
    c3/openjdk-dev    commit-2674e8a    71046748  338MB
    c3/openjdk-dev    commit-bd5cc94    0ab7fc76

This example lists all images on a specific zot server where the CVE has
been fixed:

    $ bin/zli cve remote-zot -I c3/openjdk-dev -i CVE-2017-9935 --fixed

    IMAGE NAME        TAG                       DIGEST    SIZE
    c3/openjdk-dev    commit-2674e8a-squashfs   b545b8ba  321MB
    c3/openjdk-dev    commit-d5024ec-squashfs   cd45f8cf  321MB

#### Listing repositories

You can list all repositories hosted on a zot server using the
[`zli repos`](#_zli-repos) command with the server’s alias:

    Searching... 🌍

    REPOSITORY NAME
    alpine
    busybox

## Configuring `zot`

### Configuration file

> **Note:**
> The instructions and examples in this guide use `zot` as the name of the `zot` executable file. The examples do not include the path to the executable file.


The `zot` service is initiated with the `zot serve` command
followed by the name of a configuration file. The configuration file is
a JSON or YAML file that contains all configuration settings for
`zot` functions such as:

-   network

-   storage

-   authentication

-   authorization

-   logging

-   metrics

-   synchronization with other registries

-   clustering

A simple JSON configuration file is shown in the following example.

``` json
{
    "distSpecVersion": "1.0.1",
    "storage": {
        "rootDirectory": "/tmp/zot"
    },
    "http": {
        "address": "127.0.0.1",
        "port": "8080"
    },
    "log": {
        "level": "debug"
    }
}
```

The configuration file contains the distribution specification version
(`distSpecVersion`). The structure and content of other attributes are
described in the later sections of this guide.

Using the information in this guide, you can compose a configuration
file with the settings and features you require for your `zot`
registry server.

### Extension features

With a full `zot` image, additional extension features can be
enabled and configured under an `extensions` attribute in the
configuration file as shown in the following example.

``` json
{
  ...
  "extensions": {
    "metrics": {},
    "sync": {},
    "search": {},
    "scrub": {}
  }
}
```

> **Tip:**
> The extension features are available only with a full `zot` image. With a minimal `zot` image, the `extensions` section is ignored if present.


The following features are configured under the `extensions` attribute.

-   [Metrics](#_metrics_config)

-   [Sync](#_sync_config)

-   [Search](#_search_config)

-   [Scrub](#_scrub_config)

An extension feature is enabled by the presence of the feature’s
attribute under `extensions`. An extension feature can be disabled by
omitting the feature attribute or by including an `enable` attribute
with a value of `false`.

For example, the scrub feature is enabled in the following cases.

``` json
"extensions": {
  "scrub": {}
}
```

``` json
"extensions": {
  "scrub": {
    "enable": true
  }
}
```

The scrub feature is disabled in the following cases.

``` json
"extensions": {
}
```

``` json
"extensions": {
  "scrub": {
    "enable": false
  }
}
```
<a name="verifying-config"></a>

### Verifying the configuration file

Before launching `zot`, verify the syntax of your configuration
file using the following command:

`zot verify configfile`

> **Note:**
> Verifying the configuration file protects against operator errors and any conflicts arising from `zot` release version changes.


After verifying your configuration file, you can launch `zot`
with the following command:

`zot serve configfile`

## Network configuration

Use the `http` attribute in the configuration file to configure the
`zot` network settings, as shown in the following example.

``` json
"http": {
  "address":"127.0.0.1",
  "port":"8080",
  "realm":"zot",
  "tls": {
    "cert":"test/data/server.cert",
    "key":"test/data/server.key"
  }
}
```

The following table lists the configurable attributes.

| Attribute | Description                                                                                                 |
|-----------|-------------------------------------------------------------------------------------------------------------|
| `address` | The IP address of the `zot` server.                                                                |
| `port`    | The port number of the `zot` server.                                                               |
| `realm`   | The security policy domain defined for the server.                                                          |
| `tls`     | The included attributes in this section specify the Transport Layer Security (TLS) settings for the server. |
| `cert`    | The path and filename of the server’s SSL/TLS certificate.                                                  |
| `key`     | The path and filename of the server’s registry key.                                                         |

## Storage configuration

### Storage options

With `zot`, you have the option to store your registry image
files either in local filesystem storage or in cloud storage, such as an
Amazon Simple Storage Service (S3) bucket.

### Configuring local storage

Local filesystem storage for `zot` is configured with the
`storage` attribute in the configuration file, as shown in the following
example.

``` json
"storage":{
  "rootDirectory":"/tmp/zot",
  "commit": true,
  "dedupe": true,
  "gc": true,
  "gcDelay": "1h",
  "gcInterval": "24h"
}
```

The following table lists the configurable attributes.

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 75%" />
</colgroup>
<thead>
<tr class="header">
<th style="text-align: left;">Attribute</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="text-align: left;"><p><code>rootDirectory</code></p></td>
<td style="text-align: left;"><p>Location of the images stored in the
server file system.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>commit</code></p></td>
<td style="text-align: left;"><p>For faster performance, data written by
`zot` is retained in memory before being periodically committed
to disk by the operating system. To eliminate this retention time and
cause data to be written to disk immediately, set to <code>true</code>.
This prevents data loss but reduces performance.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>dedupe</code></p></td>
<td style="text-align: left;"><p>If the server filesystem supports hard
links, you can optimize storage space by enabling inline deduplication
of layers and blobs that are shared among multiple container images.
Deduplication is enabled by default. Set to <code>false</code> to
disable deduplication.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>gc</code></p></td>
<td style="text-align: left;"><p>When an image is deleted, either by tag
or by reference, orphaned blobs can lead to wasted storage. Garbage
collection (gc) is enabled by default to reclaim this space. Set to
<code>false</code> to disable garbage collection.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>gcDelay</code></p></td>
<td style="text-align: left;"><p>(Optional) If garbage collection is
enabled, causes it to run once after the specified delay time. The
default is 1 hour. Requires the <code>gc</code> attribute to be
<code>true</code>.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>gcInterval</code></p></td>
<td style="text-align: left;"><p>(Optional) If garbage collection is
enabled, causes periodic collection at the specified interval. Must be
set based on use cases and user workloads. If no value is specified,
there is no periodic collection. Requires the <code>gc</code> attribute
to be <code>true</code>.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>subpaths</code></p></td>
<td style="text-align: left;"><p>You can store and serve images from
multiple filesystems, each with their own repository paths and settings.
The following example shows three subpaths.</p>
<div class="sourceCode" id="cb1"><pre
class="sourceCode json"><code class="sourceCode json"><span id="cb1-1"><a href="#cb1-1" aria-hidden="true" tabindex="-1"></a><span class="er">&quot;storage&quot;:</span><span class="fu">{</span></span>
<span id="cb1-2"><a href="#cb1-2" aria-hidden="true" tabindex="-1"></a>  <span class="dt">&quot;subPaths&quot;</span><span class="fu">:</span> <span class="fu">{</span></span>
<span id="cb1-3"><a href="#cb1-3" aria-hidden="true" tabindex="-1"></a>    <span class="dt">&quot;/a&quot;</span><span class="fu">:</span> <span class="fu">{</span></span>
<span id="cb1-4"><a href="#cb1-4" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;rootDirectory&quot;</span><span class="fu">:</span> <span class="st">&quot;/tmp/zot1&quot;</span><span class="fu">,</span></span>
<span id="cb1-5"><a href="#cb1-5" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;dedupe&quot;</span><span class="fu">:</span> <span class="kw">true</span><span class="fu">,</span></span>
<span id="cb1-6"><a href="#cb1-6" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;gc&quot;</span><span class="fu">:</span> <span class="kw">true</span></span>
<span id="cb1-7"><a href="#cb1-7" aria-hidden="true" tabindex="-1"></a>    <span class="fu">},</span></span>
<span id="cb1-8"><a href="#cb1-8" aria-hidden="true" tabindex="-1"></a>    <span class="dt">&quot;/b&quot;</span><span class="fu">:</span> <span class="fu">{</span></span>
<span id="cb1-9"><a href="#cb1-9" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;rootDirectory&quot;</span><span class="fu">:</span> <span class="st">&quot;/tmp/zot2&quot;</span><span class="fu">,</span></span>
<span id="cb1-10"><a href="#cb1-10" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;dedupe&quot;</span><span class="fu">:</span> <span class="kw">true</span></span>
<span id="cb1-11"><a href="#cb1-11" aria-hidden="true" tabindex="-1"></a>    <span class="fu">},</span></span>
<span id="cb1-12"><a href="#cb1-12" aria-hidden="true" tabindex="-1"></a>    <span class="dt">&quot;/c&quot;</span><span class="fu">:</span> <span class="fu">{</span></span>
<span id="cb1-13"><a href="#cb1-13" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;rootDirectory&quot;</span><span class="fu">:</span> <span class="st">&quot;/tmp/zot3&quot;</span><span class="fu">,</span></span>
<span id="cb1-14"><a href="#cb1-14" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;dedupe&quot;</span><span class="fu">:</span> <span class="kw">false</span></span>
<span id="cb1-15"><a href="#cb1-15" aria-hidden="true" tabindex="-1"></a>    <span class="fu">}</span></span>
<span id="cb1-16"><a href="#cb1-16" aria-hidden="true" tabindex="-1"></a>  <span class="fu">}</span></span>
<span id="cb1-17"><a href="#cb1-17" aria-hidden="true" tabindex="-1"></a><span class="fu">}</span></span></code></pre></div></td>
</tr>
</tbody>
</table>

### Configuring S3 storage

Amazon Simple Storage Service (S3) for `zot` can be configured
with the `storageDriver` attribute in the configuration file, as shown
in the following example:

``` json
"storageDriver": {
    "name": "s3",
    "region": "us-east-2",
    "bucket": "zot-storage",
    "secure": true,
    "skipverify": false,
    "accesskey": "<YOUR_ACCESS_KEY_ID>",
    "secretkey": "<YOUR_SECRET_ACCESS_KEY>"
}
```

As in the case with local filesystem storage, you can use multiple
storage locations using the `subpath` attribute, as in the following
example.

``` json
"subPaths": {
    "/a": {
        "rootDirectory": "/zot-a",
        "storageDriver": {
            "name": "s3",
            "region": "us-east-2",
            "bucket": "zot-storage",
            "secure": true,
            "skipverify": false
        }
    },
    "/b": {

...

    }
}
```

#### S3 Credentials

In the first configuration file example, the S3 credentials were
configured with the attributes `accesskey` and `secretkey.` As an
alternative, you can omit these attributes from the configuration file
and you can configure them using environment variables or a credential
file.

-   Environment variables

    `zot` looks for credentials in the following environment
    variables:

        AWS_ACCESS_KEY_ID
        AWS_SECRET_ACCESS_KEY
        AWS_SESSION_TOKEN (optional)

-   Credential file

    A credential file is a plaintext file that contains your access
    keys, as shown in the following example.

        [default]
        aws_access_key_id = <YOUR_DEFAULT_ACCESS_KEY_ID>
        aws_secret_access_key = <YOUR_DEFAULT_SECRET_ACCESS_KEY>

        [test-account]
        aws_access_key_id = <YOUR_TEST_ACCESS_KEY_ID>
        aws_secret_access_key = <YOUR_TEST_SECRET_ACCESS_KEY>

        [prod-account]
        ; work profile
        aws_access_key_id = <YOUR_PROD_ACCESS_KEY_ID>
        aws_secret_access_key = <YOUR_PROD_SECRET_ACCESS_KEY>

    The `[default]` heading defines credentials for the default profile,
    which `zot` will use unless you configure it to use another
    profile. You can specify a profile using the `AWS_PROFILE`
    environment variable as in this example:

        AWS_PROFILE=test-account

    The credential file must be named `credentials.` The file must be
    located in the `.aws/` folder in the home directory of the same
    server that is running your `zot` application.

For more details about specifying S3 credentials, see the [AWS
documentation](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials).

## Security and hardening

### Authentication

`zot` supports authentication by the following methods:

-   TLS mutual authentication

-   Basic local authentication using an htpasswd file

-   LDAP authentication

-   Bearer (OAuth2) authentication using an HTTP Bearer token

For detailed information about configuring authentication for your `zot`
registry, see [User Authentication and Authorization with zot](../articles/authn-authz.md).

### Identity-based authorization

User identity can be used as an authorization criterion for allowing
actions on one or more repository paths. For specific users, you can
choose to allow any combination of read, create, update, or delete
actions on specific repository paths.

For detailed information about configuring access control policies for
your `zot` registry, see [User Authentication and Authorization with
zot](../articles/authn-authz.md).

### Preventing automated attacks with failure delay

Use the `auth` and `failDelay` attributes under `http` in the
configuration file to delay the response to an authentication failure. A
delayed response helps to prevent automated attacks. The configuration
is shown in the following example.

``` json
"http": {
  "auth": {
    "failDelay": 5
  }
}
```

The `failDelay` attribute specifies a waiting time, in seconds, before
`zot` sends a failure notification to an authenticating user
who has been denied access.

### Rate limiting

You can limit the rate of API calls from users by configuring the
`Ratelimit` attribute in the configuration file, as shown in the
following example:

``` json
"http": {
    "address": "127.0.0.1",
    "port": "8080",
    "Ratelimit": {
        "Rate": 10,
        "Methods": [
            {
                "Method": "GET",
                "Rate": 5
            }
        ]
    }
}
```

In this example, the `Rate` attribute directly under `Ratelimit` sets a
global rate limit of ten API calls per second. You can optionally
override the global limit for specific API `Methods`. In this example,
API `GET` calls are limited to five per second.

## Syncing and mirroring registries

### Synchronizing registries

Add the `sync` attribute under `extensions` in the configuration file to
enable and configure the periodic or on-demand synchronization of your
`zot` image registry with other image registries, as shown in
the following example.

``` json
"extensions": {
    "sync": {
        "enable": true,
        "credentialsFile": "./examples/sync-auth-filepath.json",
        "registries": [
        {
            "urls": [
                "https://registry1:5000"
            ],
            "onDemand": false,
            "pollInterval": "6h",
            "tlsVerify": true,
            "certDir": "/home/user/certs",
            "maxRetries": 5,
            "retryDelay": "10m",
            "onlySigned": true,
            "content": [
            {
                "prefix": "/repo1/repo",
                "tags":
                {
                    "regex": "4.*",
                    "semver": true
                }
            },
            {
                "prefix": "/repo1/repo",
                "destination": "/localrepo",
                "stripPrefix": true
            },
            {
                "prefix": "/repo1/**",
                "destination": "/localrepo",
                "stripPrefix": true
            },
            {
                "prefix": "/repo2/repo*"
            },
            {
                "prefix": "/repo3/**"
            }]
        },
        {
            "urls": [
                "https://registry2:5000",
                "https://registry3:5000"
            ],
            "pollInterval": "12h",
            "tlsVerify": false,
            "onDemand": false,
            "content": [
            {
                "prefix": "/repo2",
                "tags":
                {
                    "semver": true
                }
            }]
        },
        {
            "urls": [
                "https://docker.io/library"
            ],
            "onDemand": true,
            "tlsVerify": true,
            "maxRetries": 6,
            "retryDelay": "5m"
        }]
    }
}
```

The following table lists the configurable attributes for registry
synchronization.

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 75%" />
</colgroup>
<thead>
<tr class="header">
<th style="text-align: left;">Attribute</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="text-align: left;"><p><code>enable</code></p></td>
<td style="text-align: left;"><p>If this attribute is missing, registry
synchronization is enabled by default. Registry synchronization can be
disabled by setting this attribute to <code>false</code>.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>credentialsFile</code></p></td>
<td style="text-align: left;"><p>The location of a local credentials
file containing credentials for other registries.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>urls</code></p></td>
<td style="text-align: left;"><p>The URL of an upstream image registry.
You can specify a comma-separated list of multiple URLs for the same
registry in case one or more fails.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>onDemand</code></p></td>
<td style="text-align: left;"><ul>
<li><p><code>false</code>: Pull all images not found in the local
registry.</p></li>
<li><p><code>true</code>: Pull any image not found in the local registry
only when needed.</p></li>
</ul></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>pollInterval</code></p></td>
<td style="text-align: left;"><p>The period in seconds between polling
of remote registries. If no value is specified, no periodic polling will
occur.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>tlsVerify</code></p></td>
<td style="text-align: left;"><ul>
<li><p><code>false</code>: TLS will not be verified.</p></li>
<li><p><code>true</code>: (Default) TLS will be verified.</p></li>
</ul></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>certDir</code></p></td>
<td style="text-align: left;"><p>If a path is specified, use
certificates at this path. If no path is specified, use the default
certificates directory.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>maxRetries</code></p></td>
<td style="text-align: left;"><p>The maximum number of retries if an
error occurs during either an on-demand or periodic synchronization. If
no value is specified, no retries will occur.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>retryDelay</code></p></td>
<td style="text-align: left;"><p>The interval in seconds between
retries. This attribute is mandatory when maxRetries is
configured.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>onlySigned</code></p></td>
<td style="text-align: left;"><ul>
<li><p><code>false</code>: Synchronize signed or unsigned
images.</p></li>
<li><p><code>true</code>: Synchronize only signed images (either notary
or cosigned).</p></li>
</ul></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>content</code></p></td>
<td style="text-align: left;"><p>The included attributes in this section
specify which content will be periodically pulled. If this section is
not populated, periodically polling will not occur. The included
attributes can also filter which on-demand images are pulled.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>prefix</code></p></td>
<td style="text-align: left;"><p>On the remote server, the path from
which images will be pulled. This path can be a string that exactly
matches the remote path, or it can be a <code>glob</code> pattern. For
example, the path can include a wildcard (<strong>*</strong>) or a
recursive wildcard (<strong>**</strong>).</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>destination</code></p></td>
<td style="text-align: left;"><p>Specifies the path under which pulled
images are to be stored.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>stripPrefix</code></p></td>
<td style="text-align: left;"><p>Specifies whether the prefix path from
the source registry will be retained or replaced when the image is
stored in the [zotLowerName] registry.</p>
<ul>
<li><p><code>false</code>: Retain the source prefix, append it to the
destination path.</p></li>
<li><p><code>true</code>: Remove the source prefix.</p>
<div class="note">
<p>Note: If the source prefix was specified with meta-characters (such as
<strong>**</strong>), only the prefix segments that precede the
meta-characters are removed. Any remaining path segments are appended to
the destination path.</p>
</div></li>
</ul></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>tags</code></p></td>
<td style="text-align: left;"><p>The included attributes in this
optional section specify how remote images will be selected for
synchronization based on image tags.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>regex</code></p></td>
<td style="text-align: left;"><p>Specifies a regular expression for
matching image tags. Images whose tags do not match the expression are
not pulled.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>semver</code></p></td>
<td style="text-align: left;"><p>Specifies whether image tags are to be
filtered by <a href="https://semver.org/">Semantic Versioning</a>
(semver) compliance.</p>
<ul>
<li><p><code>false</code>: Do not filter by semantic versioning</p></li>
<li><p><code>true</code>: Filter by semantic versioning</p></li>
</ul></td>
</tr>
</tbody>
</table>

## Monitoring

### Logging

Logging for `zot` operations is configured with the `log`
attribute in the configuration file, as shown in the following example.

``` json
"log":{
  "level":"debug",
  "output":"/tmp/zot.log",
  "audit": "/tmp/zot-audit.log"
}
```

The following table lists the configurable attributes.

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 75%" />
</colgroup>
<thead>
<tr class="header">
<th style="text-align: left;">Attribute</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="text-align: left;"><p><code>level</code></p></td>
<td style="text-align: left;"><p>The minimum level for logged events.
The levels are:<br />
<code>panic,</code> <code>fatal,</code> <code>error,</code>
<code>warn,</code> <code>info,</code> <code>debug,</code> and
<code>trace.</code></p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>output</code></p></td>
<td style="text-align: left;"><p>The filesystem path for the log output
file. The default is <code>stdout</code>.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>audit</code></p></td>
<td style="text-align: left;"><p>(Optional) If a filesystem path is
specified for audit logging, an audit log is enabled and will be stored
at the specified path.</p></td>
</tr>
</tbody>
</table>

### Metrics

The available methods for collecting metrics varies depending on whether
your `zot` installation is a minimal (distribution-spec-only)
image or a full image including extensions.

#### Enabling metrics for a full `zot` image with extensions

Add the `metrics` attribute under `extensions` in the configuration file
to enable and configure metrics, as shown in the following example.

``` json
"extensions": {
    "metrics": {
        "enable": true,
        "prometheus": {
            "path": "/metrics"
        }
    }
}
```

The following table lists the configurable attributes for metrics
collection.

| Attribute    | Description                                                                                                                                      |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `enable`     | If this attribute is missing, metrics collection is enabled by default. Metrics collection can be disabled by setting this attribute to `false`. |
| `prometheus` | Attributes under `prometheus` contain configuration settings for the Prometheus node exporter.                                                   |
| `path`       | The server path on which metrics will be exposed.                                                                                                |

#### Collecting metrics from a minimal `zot` image using a node exporter

Although a minimal `zot` image does not contain a node
exporter, it exposes internal metrics in a Prometheus format for
collection by a separate node exporter tool such as zxp. The
`zot` companion binary zxp is a node exporter that can be
deployed with a minimal `zot` image in order to scrape metrics
from the `zot` server.

Metrics are automatically enabled in the `zot` server upon
first scrape from the node exporter and the metrics are automatically
disabled when the node exporter has not performed any scraping for some
period. No extra `zot` configuration is needed for this
behavior.

You can download the zxp executable binary for your server platform and
architecture under "Assets" on the GitHub [zot
releases](https://github.com/project-zot/zot/releases) page.

The binary image is named using the target platform and architecture.
For example, the binary for an Intel-based MacOS server is
`zxp-darwin-amd64`. To configure the zxp example image, run this
command:

`zxp-darwin-amd64 config zxp-config-file`

> **Tip:**
> For convenience, you can rename the binary image file to simply `zxp.`


> **Tip:**
> A sample Dockerfile for zxp is available at
[Dockerfile-zxp](https://github.com/project-zot/zot/blob/main/Dockerfile-zxp).


The configuration file of zxp contains connection details for the
`zot` server from which it will scrape metrics. The following
JSON structure is an example of the `zxp-config-file` contents:

``` json
{
    "Server": {
        "protocol": "http",
        "host": "127.0.0.1",
        "port": "8080"
    },
    "Exporter": {
        "port": "8081",
        "log": {
            "level": "debug"
        }
    }
}
```

> **Tip:**
> The zxp module does not have Prometheus integration.
>
> The zxp module is not needed with a full `zot` image.

<a name="_zb_chapter"></a>

## Benchmarking zot with zb

The [zot project](https://github.com/project-zot/zot) includes the `zb`
tool, which allows you to benchmark a `zot` registry or any other
container image registry that conforms to the [OCI Distribution
Specification](https://github.com/opencontainers/distribution-spec)
published by the Open Container Initiative (OCI).

The `zb` tool is useful for benchmarking `zot` registry workloads in
scenarios such as the following:

-   comparing configuration changes

-   comparing software versions

-   comparing hardware/deployment environments

-   comparing with other registries

For detailed information about benchmarking with `zb`, see [Benchmarking zot with zb](../articles/benchmarking-with-zb.md).

## Enterprise-wide zot

### Clustering `zot`

To ensure high-availability of the registry,`zot` supports a clustering
scheme with stateless `zot` instances/replicas fronted by a loadbalancer
and a shared remote backend storage. This scheme allows the registry
service to remain available even if a few replicas fail or become
unavailable. Loadbalancing across many zot replicas can also increase
aggregate network throughput.

For detailed information about clustering with `zot`, see [zot Clustering](../articles/clustering.md).

## Maintenance

### Scrubbing the image registry

To check the integrity of the filesystem and the data in the registry,
you can schedule a periodic scrub operation. The scrub process traverses
the filesystem, verifying that all data blocks are readable. While
running, the process may slightly reduce the registry performance.

To enable scrubbing, add the `scrub` attribute under `extensions` in the
configuration file, as shown in the following example:

``` json
"extensions": {
  "scrub": {
    "enable": true,
    "interval": "24h"
  }
}
```

The following table lists the configurable attributes for scrubbing the
registry.

| Attribute  | Description                                                                                                                             |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `enable`   | If this attribute is missing, registry scrubbing is enabled by default. Scrubbing can be disabled by setting this attribute to `false`. |
| `interval` | The time interval between periodic scrub operations. This value must be at least two hours (`2h`).                                      |

### Searching and querying images

While basic searching is always enabled for images in the `zot`
registry, you can enable enhanced registry searching and filtering using
graphQL.

Add the `search` attribute under `extensions` in the configuration file
to enable and configure the enhanced search extension, as shown in the
following example.

``` json
"extensions": {
    "search": {
        "enable": true,
        "cve": {
            "updateInterval": "2h"
        }
    }
}
```

The following table lists the configurable attributes for enhanced
search.

| Attribute        | Description                                                                                                                                |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `enable`         | If this attribute is missing, enhanced search is enabled by default. Enhanced search can be disabled by setting this attribute to `false`. |
| `cve`            | Extends enhanced search to allow searching of Common Vulnerabilities and Exposures (CVE).                                                  |
| `updateInterval` | Sets the interval at which the searchable database of CVE items is refreshed.                                                              |

## Reference

<a name="_zli-command-reference"></a>

### zli Command Reference

#### zli

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

#### zli completion

This command generates the autocompletion script for `zli` for the
specified shell. See each sub-command’s help for details on how to use
the generated script.

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

#### zli config

This command modifies and lists modified settings for a running zot
registry.

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

#### zli cve

This command lists CVEs (Common Vulnerabilities and Exposures) of images
hosted on the zot registry

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

#### zli images

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

#### zli repos

This command lists all repositories in the zot registry.

    $ ./zli repos --help

    Usage:
      zli repos [config-name] [flags]

    Flags:
      -h, --help          help for repos
          --url string    Specify zot server URL if config-name is not mentioned
      -u, --user string   User Credentials of zot server in "username:password" format

    Run 'zli config -h' for details on [config-name] argument
