# Architecture

Revised: 2022-10-26

`zot` is an OCI-native container image registry. This document discusses the design goals, the overall architecture, and the design choices made in the implementation of the design goals.

## Design Goals

### OCI-first

-   Strictly conforms to the [OCI Distribution
    Specification](https://github.com/opencontainers/distribution-spec)

    `zot` intends to be **the primary** reference implementation for the
    OCI Distribution Specification. In fact, `zot` does not support any
    other vendor protocol or specification.

-   Storage layout follows the [OCI Image
    Specification](https://github.com/opencontainers/image-spec)

    The default and only supported storage layout is the OCI Image
    Layout. The implications of this choice are that any OCI image
    layout can be served by `zot` and conversely, `zot` converts data
    on-the-wire into an OCI image layout.

### Single binary model

`zot` is a single binary image with all features included so that deployment is extremely simple in various environments, including bare-metal, cloud, and embedded devices. Behavior is controlled by a single configuration file.

### Enable Only What You Need

A clear separation exists between (1) the core OCI-compliant HTTP APIs and storage functionality, and (2) other add-on features modeled as **extensions**. The extension features can be selectively enabled both at build-time and run-time.

For more information, see "Conditional Builds" in [zot Security Posture](kb:security-posture.xml#_conditional_builds).

## Overall Architecture

![504567.jpg](../assets/images/504567.jpg){width="300"}

### Interaction

External interaction with `zot` consists of the following two types:

-   Client-initiated data or meta-data queries

-   Admin-initiated configuration

All client-side interaction occurs over HTTP APIs. The core data path queries are governed by the [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec). All additional meta-data queries are handled based on the setting of the `search` extension:

-   If the `search` extension is enabled, enhanced registry searching
    and filtering is supported, using graphQL. A database is maintained
    by `zot` to efficiently answer complex queries on data stored in the
    database.

-   If the `search` extension is not enabled, basic queries are
    supported using the core APIs. These queries are less efficient and
    search actual storage, which is limited in content.

### Configuration

A single configuration file governs `zot` instance behavior. An exception can be made for security concerns, wherein configuration items containing sensitive credentials can be stored in separate files referenced by the main configuration file. Using separate files allows stricter permissions to be enforced on those files if stored locally. Also, modeling as external files allows for storing [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/).

The configuration file is divided into sections for `http`, `storage`, `log`, and `extension`, governing the behavior of the respective components.

### Authentication and Authorization

A robust set of authentication and authorization options are supported natively in `zot`. These controls are enforced before access is allowed into the storage layer.

For more information, see [User Authentication and Authorization with zot](kb:authn-authz.xml).

### Storage Driver Support

`zot` supports any modern local filesystem. Remote filesystems, such as AWS S3 or any AWS S3-compatible storage system, are supported. Additional driver support is planned in the roadmap.

> **Note:**
> Deduplication is supported for both local and remote filesystems, but deduplication requires a filesystem with hard-link support.

For more information, see [Storage Planning with zot](kb:storage.xml).

### Security Scanning

`zot` integrates with the [`trivy`](https://github.com/aquasecurity/trivy) security scanner to scan container images for vulnerabilities. The database is kept current by periodically downloading any vulnerability database updates at a configurable interval. The user remains agnostic of the actual scanner implementation, which may change over time.

### Extensions

Wherever applicable, extensions can be dynamically discovered using the [extensions support](https://github.com/opencontainers/distribution-spec/tree/main/extensions) of the OCI Distribution Specification. The following extensions are currently supported:

-   **Search**

    One of the key functions of a container image registry (which is
    essentially a graph of blobs) is the ability to perform interesting
    image and graph traversal queries. The user interacts with the
    **search** extension via a graphQL endpoint. The schema is published
    with every release.

    Examples of queries are:

    -   "Does an image exist?"

    -   "What is its size?"

    -   "Does an image depend on this image via its layers?"

    -   "What vulnerabilities exist in an image or its dependent
        images?"

-   **Sync**

    You can deplay a local mirror pointing to an upstream `zot` instance
    with various container image download policies, including on-demand
    and periodic downloads. The **sync** function is useful to avoid
    overwhelming the upstream instance, or if the upstream instance has
    rate-limited access.

    > **Tip:**
    > `docker.io` is supported as an upstream mirror.


-   **Lint**

    The **lint** extension helps to avoid image compliance issues by
    enforcing certain policies about the image or the image metadata.
    Currently, **lint** can check an uploaded image to enforce the
    presence of required annotations such as the author or the license.

-   **Scrub**

    Although container images are content-addressable with their SHA256
    checksums, and validations are performed during storage and
    retrieval, it is possible that bit-rot sets in when not in use. The
    **scrub** extension actively scans container images in the
    background to proactively detect errors.

### Background Tasks

Several periodic tasks occur in the registry, such as garbage collection, sync mirroring, and scrubbing. A task scheduler handles these tasks in the background, taking care not to degrade or interrupt foreground tasks running in the context of HTTP APIs.
