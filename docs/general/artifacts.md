# Released Artifacts for zot

Revised: 2022-09-08

This document describes the available zot images for the various supported hardware and software platforms, along with information about image variations, image locations, and image naming formats.

## Available releases

As of the revision date of this document, the available zot versions are:

Table: available versions

| Version    | Status      | Release date |
|------------|-------------|--------------|
| v1.4.2-rc5 | development | TBD          |


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


## Full and minimal binary images

In addition to variations for specific platforms and architectures, binary images are also available in full and minimal flavors:

-   A full `zot` binary image is compiled with all extensions. Extensions
    include functions such as metrics, registry synchronization, search,
    and scrub.

-   A minimal distribution-spec conformant `zot` binary image is compiled
    with only a minimal set of code and libraries, reducing the attack
    surface. This option might be optimal for a registry embedded in a
    shipping product.

## Binary image file naming

An executable binary image for `zot` is named using the target platform and architecture from the [Supported platforms and architectures](#supported-platforms-zot) table. The general format of a binary image file name is one of these two:

`zot-os-architecture`

-   A full zot binary image with all extensions has a filename of the
    form `zot-os-architecture.` For example, the full binary image for
    an Intel-based linux server is `zot-linux-amd64`.

`zot-os-architecture-minimal`

-   A minimal distribution-spec conformant zot binary image has a
    filename of the form `zot-os-architecture-minimal`. For example, the
    minimal binary image for an Intel-based linux server is
    `zot-linux-amd64-minimal`.

> **Tip:**
> For convenience, you can rename the binary image file to simply `zot` after downloading.


## Where to get zot

The `zot` project is hosted on GitHub at [project-zot](https://github.com/project-zot/zot).

`zot` images are currently hosted in these publicly-accessible repositories:

-   zotregistry.io

-   artifacthub.io

> **Tip:**
> You may need to use the `chmod` command to make the image executable.

## zot Licensing

`zot` is released under the [Apache License 2.0](https://github.com/project-zot/zot/blob/main/LICENSE).
