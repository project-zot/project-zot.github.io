# Getting Started with zot Administration

> :point_right: This document helps you to deploy an appropriate zot image or to build zot if desired.
> 
> After deploying zot, proceed to [Configuring zot](admin-configuration.md) to choose and configure the features you need.

## Installing zot

### How to get zot

The zot project is hosted on GitHub at
[project-zot](https://github.com/project-zot/zot). From GitHub, you can
download zot executable binary images or full source code.

<a name="supported-platforms-zot"></a>

#### Supported platforms

zot is officially supported on Linux and Apple MacOS
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

Refer to [*Released Images for zot*](../general/releases.md) for
information about available zot images along with information about
image variations, image locations, and image naming formats.

#### Deployment methods

Several options exist for deploying zot:

-   You can launch a zot binary as a container service using
    a container management tool such as Podman, Docker, or Helm.

-   You can launch zot as a host-level service by downloading
    a binary image and running it as a systemd service.

-   You can copy or clone the full zot source code and build
    an image with custom build flags.

### Deploying a zot binary image

Executable binary images for supported server platforms and
architectures are available from the [zot package
repository](https://github.com/orgs/project-zot/packages?repo_name=zot)
in GitHub.

You can download the appropriate binary image and run it directly on
your server, or you can use a container management tool such as Podman,
runc, Helm, or Docker to fetch and deploy the image in a container on
your server.

> :bulb: For convenience, you can rename the binary image file to simply `zot`.


#### Example: Deploying with a container manager

Using a container manager such as Podman, runc, Helm, or Docker, you can
install a zot binary image, as in the following examples.

**Using podman**

    podman run -p 5000:5000 ghcr.io/project-zot/zot-linux-amd64:latest

    podman run -p 5000:5000 ghcr.io/project-zot/zot-minimal-linux-amd64:latest

<details>
  <summary markdown="span">Click here to view an example of deploying using podman.</summary>

<p align="center">
  <img width="600" src="https://raw.githubusercontent.com/project-zot/zot/710395377747b93ac11b7d1304cb2ab1059d34f6/demos/podman-getting-started.svg"></img>
</p>

</details>

**Using docker**

    docker run -p 5000:5000 ghcr.io/project-zot/zot-linux-amd64:latest

Each of these example commands pulls a zot binary image from
the GitHub Container Registry (ghcr.io) and launches a zot
image registry at `http://localhost:5000`.

<details>
  <summary markdown="span">Click here to view an example of deploying using docker.</summary>

<p align="center">
  <img width="600" src="https://raw.githubusercontent.com/project-zot/zot/710395377747b93ac11b7d1304cb2ab1059d34f6/demos/docker-getting-started.svg"></img>
</p>

</details>

### Building zot from source

#### Prerequisites

##### Install golang (1.19+)

The zot project requires `golang 1.19` or newer. You can follow the [golang instructions](https://go.dev/learn/) to install the `golang` toolchain.
After installation, make sure that the `path` environment variable or
your IDE can find the toolchain.

#### Building an executable binary from source

Download or clone the full zot project from GitHub at
[project-zot](https://github.com/project-zot/zot). To clone the
zot project from GitHub, use this command:

    git clone https://github.com/project-zot/zot.git

To build zot, execute the `make` command in the
`zot` directory using the following general syntax:

`make OS=os ARCH=architecture {binary | binary-minimal}`


> -   The operating system and architecture options are listed in the
    [Supported platforms and
    architectures](#supported-platforms-zot)
    table. If an option is not specified, the defaults are `linux` and
    `amd64`.
>
> -   The `binary` option builds the full zot binary image with
    all extensions.
>
> -   The `binary-minimal` option builds the minimal distribution-spec
    conformant zot binary image without extensions, reducing
    the attack surface.


For example, to build a zot image with extensions for an
Intel-based linux server, use the following command:

    make OS=linux ARCH=amd64 binary

The `make` command builds an executable image in the `zot/bin`
directory. The original filename of the zot executable image
will indicate the build options. For example, the filename of an
Intel-based linux minimal image is `zot-linux-amd64-minimal`.

> :bulb:
> For convenience, you can rename the binary image file to simply `zot`.


#### Building a zot container image from source

**with Stacker**

Using the settings in stacker.yaml, you can build a container image that
runs the latest zot by running the following command:

    make binary-stacker

**with Docker**

A [sample Dockerfile](https://github.com/project-zot/zot/tree/main/build/Dockerfile) 
is provided on the zot project page in
GitHub. You can edit the sample file with your specific values, such as
the desired operating system, hardware architecture, and full or minimal
build, as in this example:

    ARG OS=linux
    ARG ARCH=amd64

    RUN make COMMIT=$COMMIT OS=$OS ARCH=$ARCH clean binary-minimal

Using your edited Dockerfile, you can build a container image that runs
the latest zot by running the following command:

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

We recommend that, when deploying zot, you also install the command line ([zli](../user-guides/zli.md)) and benchmarking ([zb](../articles/benchmarking-with-zb.md)) packages.

### Launching zot

The zot service is initiated with the `zot serve` command followed by the name of a configuration file, as in this example:

`zot serve config.yml`

> :bulb:
> For convenience, you can rename the binary image file to simply `zot`.The instructions and examples in this guide use `zot` as the name of the zot executable file and do not include the path to the executable file.


## Next Steps

### Configuring zot

You configure zot primarily through adding and modifying settings in the zot configuration file. The configuration file is a JSON or YAML file that contains all configuration settings for zot functions. 

When you first build zot or deploy an image or container from the distribution, a basic configuration file `config.json` is created. You can modify the initial file or you can create a new file.

Follow the instructions in [Configuring zot](admin-configuration.md), to compose a configuration file with the settings and features you require for your zot registry server.

