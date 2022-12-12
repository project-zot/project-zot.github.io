# zot Security Posture

> An overview of `zot` build-time and runtime security hardening features, including:
>
> -   Build-time hardening such as PIE-mode builds
> -   Minimal-build option for smaller attack surface
> -   Open Source Security Foundation best practices for CI/CD
> -   Non-root deployment
> -   Robust authentication/authorization options


The `zot` project takes a defense-in-depth approach to security, applying industry-standard best practices at various stages. Recognizing that security hardening and product features are sometimes in conflict with each other, we also provide flexibility both at build and deployment time.

## Build-time hardening

The following are the steps taken during build-time.

### PIE build-mode

The `zot` binary is built with [PIE](https://en.wikipedia.org/wiki/Position-independent_code) build-mode enabled to take advantage of [ASLR](https://en.wikipedia.org/wiki/Address_space_layout_randomization) support in modern operating systems such as [Linux ASLR](https://lwn.net/Articles/569635/). While `zot` is intended to be a long-running service (without frequent restarts), it prevents attackers from developing a generic attack that depends on predictable memory addresses *across* multiple `zot` deployments.

### Conditional builds

Functionality in `zot` is broadly organized as a *core* [Distribution Specification](https://github.com/opencontainers/distribution-spec) implementation and additional features as *extensions*. The rationale behind this approach is to minimize or control library dependencies that get included in the binary and consequently the attack surface.

We currently build and release two image flavors:

-   **minimal**, which is a minimal Distribution Specification
    conformant registry, and

-   **full**, which incorporates the *minimal* build **and** all
    extensions

The *minimal* flavor is for the security-minded and minimizes the number of dependencies and libraries. The *full* flavor is for the functionality-minded with the caveat that the attack surface of the binary is potentially broader. However by no means are these the only options. Our build (via the `Makefile`) provides the flexibility to pick and choose extensions in order to build a binary between *minimal* and *full*. For example,

`make EXTENSIONS=search binary`

produces a `zot` binary with only the *search* feature enabled.

### CI/CD pipeline

`zot` CI/CD process attempts to align with the Open Source Security Foundation (OSSF) [best practices guidelines](https://bestpractices.coreinfrastructure.org/en) to achieve high code quality.

#### Code reviews

`zot` is an open source project and all code submissions are open and transparent. Every pull request (PR) submitted to the project repository must be reviewed by the code owners. We have additional CI/CD workflows monitoring for unreviewed commits.

#### CI/CD checks

All PRs must pass the full CI/CD pipeline checks including unit, functional, and integration tests, code quality and style checks, and performance regressions. In addition, all binaries produced are subjected to further security scans to detect any known vulnerabilities.

## Runtime hardening

The following steps can be taken to harden a `zot` deployment.

### Unprivileged runtime process

Running `zot` doesn’t require *root* privileges. In fact, the recommended approach is to create a separate user/group ID for the `zot` process.

### Authentication

All interactions with `zot` are over HTTP APIs, and `htpasswd`-based local authentication, LDAP, mutual TLS, and token-based authentication mechanisms are supported. We strongly recommend enabling a suitable mechanism for your deployment use case in order to prevent unauthorized access. See the provided [authentication examples](https://github.com/project-zot/zot/tree/main/examples).

### Access control

Following authentication, it is further possible to allow or deny actions by a user on a particular repository stored on the `zot` registry. See the provided [access control examples](https://github.com/project-zot/zot/tree/main/examples).

## Vulnerability scans

Apart from hardening the deployment itself, `zot` also supports security
scanning of stored container images.

## Reporting security issues

We understand that no software is perfect and in spite of our best efforts, security bugs may be found. Refer to our [security policy](https://github.com/project-zot/zot/blob/main/SECURITY.md) for taking a responsible course of action when reporting security bugs.
