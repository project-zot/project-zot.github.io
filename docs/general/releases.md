# Released Images for zot

> :point_right: This document describes the available zot images for the various supported hardware and software platforms, along with information about image variations, image locations, and image naming formats.

<a name='supported-platforms-zot'></a>

## Supported platforms

zot is supported on Linux and Apple MacOS platforms with Intel or ARM processors.

Table: Supported platforms and architectures

| OS     | ARCH  | Platform                            |
|--------|-------|-------------------------------------|
| linux  | amd64 | Intel-based Linux servers           |
| linux  | arm64 | ARM-based servers and Raspberry Pi4 |
| darwin | amd64 | Intel-based MacOS                   |
| darwin | arm64 | ARM-based MacOS (Apple M1)          |
| freebsd | amd64 | Intel-based FreeBSD<sup>*</sup>    |
| freebsd | arm64 | ARM-based FreeBSD<sup>*</sup>      |

<sup>*</sup> **NOTE:** While binary images are available for FreeBSD, building container images is not supported at this time.

## Full and minimal binary images

In addition to variations for specific platforms and architectures, binary images are also available in full and minimal flavors:

-   A full zot binary image is compiled with all extensions. Extensions include functions such as metrics, registry synchronization, search, and scrub.

-   A minimal distribution-spec conformant zot binary image is compiled with only a minimal set of code and libraries, reducing the attack surface. This option might be optimal for a registry embedded in a shipping product.

## Binary image file naming

An executable binary image for zot is named using the target platform and architecture from the [Supported platforms and architectures](#supported-platforms-zot) table. The general format of a binary image file name is one of these two:

`zot-<os>-<architecture>`

-   A full zot binary image with all extensions has a filename of the form `zot-<os>-<architecture>.` For example, the full binary image for an Intel-based linux server is `zot-linux-amd64`.

`zot-<os>-<architecture>-minimal`

-   A minimal distribution-spec conformant zot binary image has a filename of the form `zot-<os>-<architecture>-minimal`. For example, the minimal binary image for an Intel-based linux server is `zot-linux-amd64-minimal`.

> :bulb:
> For convenience, you can rename the binary image file to simply `zot` after downloading.


## Where to get zot

You can download native executable binary images or container (OCI) images.

### Getting binary images

The zot project is hosted on GitHub at [project-zot](https://github.com/project-zot/zot).  

To download a binary image, go to the [zot releases](https://github.com/project-zot/zot/releases) and select a release. Go to the **Assets** section of the release page and download the binary for your platform and architecture.

> :pencil2: 
> You may need to use the `chmod` command to make the image executable.

> :pencil2: 
> When downloading a binary image for MacOS, download the darwin image.

### Getting container images 

The zot project publishes OCI container images to GitHub Container Registry (ghcr.io). All images support multiple architectures (linux/amd64, linux/arm64, freebsd/amd64, freebsd/arm64) and Docker/Podman will automatically pull the correct architecture for your platform.

**Main Images:**

- **zot** (full-featured): `ghcr.io/project-zot/zot:latest` or `ghcr.io/project-zot/zot:v2.1.11`
  - Includes all extensions built into binary: sync, search, scrub, metrics, lint, ui, mgmt, profile, userprefs, imagetrust, events
  - Extensions enabled by default: search (with CVE scanning), ui (web interface), mgmt (management API)
  - Other extensions (sync, scrub, metrics, lint, profile, userprefs, imagetrust, events) require configuration to enable
  - **Default configuration** (`/etc/zot/config.json`):
    ```json
    {
      "storage": {
        "rootDirectory": "/var/lib/registry"
      },
      "http": {
        "address": "0.0.0.0",
        "port": "5000",
        "compat": ["docker2s2"]
      },
      "log": {
        "level": "debug"
      },
      "extensions": {
        "search": {
          "enable": true,
          "cve": {
            "updateInterval": "2h"
          }
        },
        "ui": {
          "enable": true
        },
        "mgmt": {
          "enable": true
        }
      }
    }
    ```

- **zot-minimal** (minimal dist-spec only): `ghcr.io/project-zot/zot-minimal:latest` or `ghcr.io/project-zot/zot-minimal:v2.1.11`
  - No extensions included; core OCI Distribution Specification functionality only
  - **Default configuration** (`/etc/zot/config.json`):
    ```json
    {
      "storage": {
        "rootDirectory": "/var/lib/registry"
      },
      "http": {
        "address": "0.0.0.0",
        "port": "5000"
      },
      "log": {
        "level": "debug"
      }
    }
    ```

- **zxp** (zot-exporter): `ghcr.io/project-zot/zxp:latest` or `ghcr.io/project-zot/zxp:v2.1.11`
  - Standalone metrics exporter for zot-minimal deployments
  - **Default configuration** (`/etc/zxp/config.json`):
    ```json
    {
      "Server": {
        "protocol": "http",
        "host": "127.0.0.1",
        "port": "5000"
      },
      "Exporter": {
        "port": "5001",
        "log": {
          "level": "debug"
        }
      }
    }
    ```

- **zb** (benchmark tool): `ghcr.io/project-zot/zb:latest` or `ghcr.io/project-zot/zb:v2.1.11`
  - Performance benchmarking tool

**Example usage:**

    docker pull ghcr.io/project-zot/zot:latest
    docker pull ghcr.io/project-zot/zot-minimal:latest

> :pencil2: 
> Container images are Linux-based (or FreeBSD-based). When running containers on MacOS, Docker/Podman runs Linux containers in a VM. The container runtime will automatically select the appropriate Linux architecture based on your Docker/Podman environment.

## Licensing

zot is released under the [Apache License 2.0](https://github.com/project-zot/zot/blob/main/LICENSE).
