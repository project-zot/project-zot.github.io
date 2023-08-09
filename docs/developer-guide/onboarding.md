# Onboarding zot for Development

> :point_right: zot is a production-ready, open-source, extensible OCI-native image registry, built for developers by developers.

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

#### Install golang

Follow the [golang instructions](https://go.dev/learn/) to install the `golang` toolchain. After installation, make sure that the `path` environment variable or your IDE can find the toolchain.

> :pencil2: You must use a golang version of at least the minimum specified in [go.mod](https://github.com/project-zot/zot/go.mod) or the build will fail.

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
linux minimal image is `zot-minimal-linux-amd64`.

<details>
  <summary markdown="span">Click here to view an example of the getting started process.</summary>

<p align="center">
  <img width="600" src="https://raw.githubusercontent.com/project-zot/zot/710395377747b93ac11b7d1304cb2ab1059d34f6/demos/multi-arch-getting-started.svg"></img>
</p>

</details>


### Running zot

The behavior of zot is controlled via configuration only. To launch the
zot server, execute the following command:

    $  bin/zot-linux-amd64 serve examples/config-minimal.json

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

The zot project codebase is organized as follows:

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

## Additional state in zot

In addition to the storage of repository images, zot stores data for various processes in local and remote storage and databases.  The following table shows the storage locations for different processes and types of data.

<table>
	<tr>
		<th>Data or Process</th>
		<th>Storage Location</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>images</td>
		<td>local and<br/>AWS S3</td>
		<td>Image blobs</td>
	</tr>
	<tr>
		<td>repository synchronization</td>
		<td>local<br/>/&lt;repo_name&gt;/.sync</td>
		<td>The sync operation temporarily copies the upstream blobs to:<br/> /&lt;repo_name&gt;/.sync/${UUID}/&lt;repo_name&gt;, then copies to /&lt;repo_name&gt; and deletes the temporary directory ${UUID}</td>
	</tr>
	<tr>
	<td rowspan="2">deduplication</td>
		<td>local<br/>/cache.db</td>
		<td>Cache for deduplication of files stored locally</td>
	</tr>
	<tr>
		<td>AWS DynamoDB</td>
		<td>Cache for deduplication of files stored in AWS</td>
	</tr>
	<tr>
		<td>CVE</td>
		<td>local<br/>/_trivy</td>
		<td>Database of Common Vulnerabilities and Exposures (CVE) information and scan results</td>
	</tr>
	<tr>
		<td>user sessions</td>
		<td>local<br/>/_sessions</td>
		<td>zot user session authentication (for zui)</td>
	</tr>
	<tr>
		<td rowspan="2">PKI authentication documents</td>
		<td>local<br/>/_cosign</td>
		<td>Private keys for signature verification using cosign</td>
	</tr>
	<tr>
		<td>local<br/>/_notation</td>
		<td>Certificates for signature verification using notation</td>
	</tr>
	<tr>
	<td rowspan="2">metadata</td>
		<td>local<br/>/repo.db</td>
		<td>Local storage of manifests, configurations, download counters, signature verification results</td>
	</tr>
	<tr>
		<td>AWS DynamoDB</td>
		<td>Cloud storage of manifests, configurations, download counters, signature verification results</td>
	</tr>
</table>
