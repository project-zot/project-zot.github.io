# Benchmarking zot with zb

> The `zb` tool is useful for benchmarking OCI registry workloads in scenarios such as the following:
>
> -   comparing configuration changes
> -   comparing software versions
> -   comparing hardware/deployment environments
> -   comparing with other registries


With the `zb` tool, you can benchmark a `zot` registry or any other container image registry that conforms to the [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec) published by the Open Container Initiative (OCI).

> **Tip:**
> We recommend installing and benchmarking with `zb` when you install `zot`.


## How to get zb

The `zb` project is hosted with `zot` on GitHub at [project-zot](https://github.com/project-zot/zot). From GitHub, you can download the `zb` binary or you can build `zb` from the source. You can also directly run the released docker image.

<a name="supported-platforms"></a>
## Supported platforms and architectures

`zb` is supported for the following operating systems and platform architectures:

| OS     | ARCH  | Platform                            |
|--------|-------|-------------------------------------|
| linux  | amd64 | Intel-based Linux servers           |
| linux  | arm64 | ARM-based servers and Raspberry Pi4 |
| darwin | amd64 | Intel-based MacOS                   |
| darwin | arm64 | ARM-based MacOS                     |


## Downloading zb binaries

Download the executable binary for your server platform and architecture under "Assets" on the GitHub [zot releases](https://github.com/project-zot/zot/releases) page.

The binary image is named using the target platform and architecture from the [Supported platforms and architectures](#supported-platforms) table. For example, the binary for an Intel-based MacOS server is `zb-darwin-amd64`.

## Building zb from source

To build the `zb` binary, copy or clone the `zot` project from GitHub and execute the `make bench` command in the `zot` directory. Use the same command options that you used to build `zot`, as shown:

`make OS=os ARCH=architecture bench`

For example, the following command builds `zb` for an Intel-based MacOS server:

`make OS=darwin ARCH=amd64 bench`

In this example, the resulting executable file is `zb-darwin-amd64` in the `zot/bin` directory.

> **Tip:**
> A sample Dockerfile for `zb` is available at [Dockerfile-zb](https://github.com/project-zot/zot/tree/main/build/Dockerfile-zb).



## Running zb

> **Tip:**
> The instructions and examples in this guide use `zb` as the name of the executable file.

The original filename of the executable file will reflect the build options, such as `zb-linux-amd64.` For convenience, you can rename the executable to simply `zb.`


### Usage

To view the usage and options of `zb`, run the command with the `--help` option:

`bin/zb --help`

Command output:

```
    Usage:
      zb <url> [flags]

    Flags:
      -A, --auth-creds string      Use colon-separated BASIC auth creds
      -c, --concurrency int        Number of multiple requests to make at a time (default 1)
      -h, --help                   help for zb
      -o, --output-format string   Output format of test results: stdout (default), json, ci-cd
      -r, --repo string            Use specified repo on remote registry for test data
      -n, --requests int           Number of requests to perform (default 1)
      -s, --src-cidr string        Use specified cidr to obtain ips to make requests from, src-ips and src-cidr are mutually exclusive
      -i, --src-ips string         Use colon-separated ips to make requests from, src-ips and src-cidr are mutually exclusive
      -v, --version                Show the version and exit
      -d, --working-dir string     Use specified directory to store test data
```

### Example

The following example executes a benchmark operation using zb.

`bin/zb -c 10 -s 127.0.10.0/24 -n 1000 http://localhost:8080`

You can also run the released docker image.

`docker run --net=host -it ghcr.io/project-zot/zb-linux-amd64:latest -c 10 -n 1000 -s 127.0.10.0/24 http://localhost:8080`

Command output:

```

    Registry URL: http://localhost:8080

    Concurrency Level: 2
    Total requests:    100
    Working dir:

    ========
    Test name:            Get Catalog
    Time taken for tests: 45.397205ms
    Complete requests:    100
    Failed requests:      0
    Requests per second:  2202.7788

    2xx responses: 100

    min: 402.259µs
    max: 3.295887ms
    p50: 855.045µs
    p75: 971.709µs
    p90: 1.127389ms
    p99: 3.295887ms

    ========
    Test name:            Push Monolith 1MB
    Time taken for tests: 952.336383ms
    Complete requests:    100
    Failed requests:      0
    Requests per second:  105.00491

    2xx responses: 100

    min: 11.125673ms
    max: 26.375356ms
    p50: 18.917253ms
    p75: 21.753441ms
    p90: 24.02137ms
    p99: 26.375356ms

    ...

```
