# What's New

## [v2.1.14](https://github.com/project-zot/zot/releases/tag/v2.1.14)

### Workload Identity Federation

zot can now authenticate workloads using OIDC ID tokens, enabling secret-less authentication for automated workflows.

See [examples/config-bearer-oidc-workload.json](https://github.com/project-zot/zot/blob/v2.1.14/examples/config-bearer-oidc-workload.json) for an example configuration.

### Bug fixes

Many bug fixes around storage and other miscellaneous features.

## [v2.1.13](https://github.com/project-zot/zot/releases/tag/v2.1.13)

### Bug fixes

Fixes a bug where requests having an Authorization header are rejected if basic
auth is disabled.

## [v2.1.12](https://github.com/project-zot/zot/releases/tag/v2.1.12)

### mTLS Configuration

Previously, there were some access control/authz limitations when enabling UI
and mTLS for machine clients. Now [mTLS authn configuration](../articles/authn-authz.md#mutual-tls-authentication) supports more
flexible identity extraction from peer certs so that access control is
uniformly enforced.

### Bug fixes

Many bug fixes around security, sync and other miscellaneous features.

## [v2.1.11](https://github.com/project-zot/zot/releases/tag/v2.1.11)

### Further FIPS 140-3 Improvements

Previously, password-based authentication supported only _bcrypt_ (based on
Blowfish) which is not FIPS 140 approved. Starting with this release, both
SHA256 and SHA512 based hashes are supported. You can use `mkpasswd` utility
(available on most Linux distributions) for this purpose.

### Test Retention Policies

A `verify-feature` retention subcommand has been added that allows users to
preview and validate retention policy changes without running the actual zot
server. The command runs GC and retention tasks in dry-run mode for immediate
feedback.

`zot verify-feature retention -l /var/log/zot-retention-check.log -i 1m -t 10m <config-file>`

### Improved Self-Hosted OAuth2 Support

Some self-hosted applications such as GitHub Enterprise require custom auth url,
token url and username claim mapping.

```json
  "auth": {
      "openid": {
        "providers": {
          "github": {
            "clientid": <client_id>,
            "clientsecret": <client_secret>,
            "authurl": "https://github.company.com/login/oauth/authorize",     // Custom GHE authorization endpoint
            "tokenurl": "https://github.company.com/login/oauth/access_token", // Custom GHE token endpoint
            "scopes": ["read:org", "user", "repo"],
            "claimMapping": {
              "username": "preferred_username"                                 // Custom claim mapping
            }
          }
        }
      }
```

### UI Improvements

zot's UI has been migrated to use [vite](https://vite.dev/) which helps with
startup times and long-term project maintenance.

### Bug fixes

Many bug fixes around security, sync and other miscellaneous features.

## [v2.1.10](https://github.com/project-zot/zot/releases/tag/v2.1.10)

### zot as a Golang Library

zot was originally intended as an application although implemented in golang.
Starting from this release zot can also be used as a golang [library](https://pkg.go.dev/zotregistry.dev/zot/v2).

`import zotregistry.dev/zot/v2`

However, note that this aspect will be best-effort only.

### Bug fixes

Some minor bug fixes.

## [v2.1.9](https://github.com/project-zot/zot/releases/tag/v2.1.9)

### Garbage Collection and Retention

Untagged manifests are now removed by default in garbage collection unless they are referenced by indexes or artifacts.
Previously they were only removed if the retention policies settings were present in the zot configuration.
If unspecified, the configuration option for retention delay (used for untagged manifests and orphan referrers),
now defaults to the GC delay instead of 24 hours.

### FIPS 140-3 Compliance

On Linux, zot can be deployed in FIPS 140-3 mode (in terms of
cryptographic protocols used) by setting the environment variable
[`GODEBUG="fips140=only"`](https://go.dev/doc/security/fips140).

Note that GODEBUG=fips140=on and only are not supported on OpenBSD, Wasm, AIX, and 32-bit Windows platforms.

### Bug fixes

Update the GraphQL playground version to 5.2, as the old one had broken online dependencies.

## [v2.1.8](https://github.com/project-zot/zot/releases/tag/v2.1.8)

### Bug fixes

Some bug fixes in sync mirroring and garbage collection.

## [v2.1.7](https://github.com/project-zot/zot/releases/tag/v2.1.7)

### zot OCI Container Images for FreeBSD

FreeBSD community has been releasing [OCI images](https://download.freebsd.org/releases/OCI-IMAGES/) to enable their container ecosystem.

zot is now releasing OCI images to deploy and run as native FreeBSD containers.
For example, `ghcr.io/project-zot/zot-freebsd-amd64:latest`.

### Bug fixes

Some minor bug fixes.

## [v2.1.6](https://github.com/project-zot/zot/releases/tag/v2.1.6)

### Liveness and Readiness Endpoints for Kubernetes Deployments

New HTTP endpoints are added for improved Kubernetes deployments - `/livez`,
`/readyz` and `/startupz`. Helm chart has been updated.

### OpenID Credentials Stored in Files

Previously OpenID credentials were specified inline in zot configuration. Now,
they can be loaded from a separate file and the file can be constructed as a
Kubernetes `Secret`.

### Bug fixes

Some bug fixes around FreeBSD builds.

## [v2.1.5](https://github.com/project-zot/zot/releases/tag/v2.1.5)

### Gitlab Social Login

Gitlab login is now supported in zot UI.

### Events Extension Token and Custom HTTP Header Support

Earlier, [events extension](../articles/events.md) for HTTP sink supported only
basic authentication. Now token authentication is supported. Furthermore, you
can also include customer HTTP headers to enable sink side routing, etc.

## [v2.1.4](https://github.com/project-zot/zot/releases/tag/v2.1.4)

### Bug fixes

Some bug fixes around authentication and authorization.

## [v2.1.3](https://github.com/project-zot/zot/releases/tag/v2.1.3)

### Event generation

zot can now generate [registry-significant events](../articles/events.md) that can be published to http or nats endpoints.

### Improved `docker` Support in UI

Native docker images are now correctly displayed in the Web UI.

### Redis driver Support

Previous releases supported a local BoltDB or a remote DynamoDB database in
order to store image and blob metadata. This release now includes support for
[_Redis_](../articles/storage.md/#redis).

### AWS ECR Sync Support With Temporary Token Authentication

[AWS ECR](../articles/mirroring.md/#example-support-for-aws-ecr) can now be used as the upstream registry to mirror from and the
configuration allows for an authentication helper.

### Sync Exclude Regex

While mirroring from an upstream registry, it is now possible to exclude images with a regex pattern.

### Windows Binaries

Native Windows binaries (both amd64 and arm64) are now distributed with the release.

### Bug fixes

The following security issue has been fixed in this release.

[<code>GHSA-c37v-3c8w-crq8/CVE-2025-48374</code>](https://github.com/project-zot/zot/security/advisories/GHSA-c37v-3c8w-crq8)

## [v2.1.2](https://github.com/project-zot/zot/releases/tag/v2.1.2)

### Compatibility with other image schema types

A [new configuration setting](../admin-guide/admin-configuration.md#compatibility-with-other-image-schema-types) allows you to store images using the schema [Docker Manifest v2 Schema v2](https://distribution.github.io/distribution/spec/manifest-v2-2/). With this setting enabled, zot makes no modifications to the image's manifest or digest. Such modifications would otherwise break the image's signature and attestations.

### Bug fixes

The following security issue has been fixed in this release.

[<code>GHSA-c9p4-xwr9-rfhxi/CVE-2025-23208</code>](https://github.com/project-zot/zot/security/advisories/GHSA-c9p4-xwr9-rfhx)

## [v2.1.0](https://github.com/project-zot/zot/releases/tag/v2.1.0)

### Scale-out cluster

You can build a [scale-out cluster](../articles/scaleout.md) (proxy/shard based
on repository name). Scale-out cluster is compatible with "sync" feature.

### Bug fixes

The following security issue has been fixed in this release.

[<code>GHSA-55r9-5mx9-qq7r/CVE-2024-39897</code>](https://github.com/project-zot/zot/security/advisories/GHSA-55r9-5mx9-qq7r)


## [v2.0.4](https://github.com/project-zot/zot/releases/tag/v2.0.4)

This is a maintenance release with minor bug fixes.

## [v2.0.3](https://github.com/project-zot/zot/releases/tag/v2.0.3)

This is a maintenance release with minor bug fixes.

## [v2.0.2](https://github.com/project-zot/zot/releases/tag/v2.0.2)

### CVE Query Enhancements

It is now possible to bisect CVEs (`zli cve diff`) between two image
tags/versions in the same repository. Furthermore, a CVE query for a particular
image tag can return a detailed description of CVEs.

### Documentation for "Immutable Image Tags"

A new article has been added to document how image tags can be made
[immutable](../articles/immutable-tags.md).

### Cross-repo tag search in UI

You can now search for a tag across all repos by starting your query as
':<tag>' in the UI, which will return all images that have that tag.

### Support for [ORAS Artifacts](https://github.com/oras-project/artifacts-spec) removed

[OCI distribution spec](https://github.com/opencontainers/distribution-spec)
1.1.0 has added support "artifacts" which is likely to gain wider adoption.
ORAS artifacts are not widely used or supported.

    :warning:  Support is removed starting from this version.

## [v2.0.1](https://github.com/project-zot/zot/releases/tag/v2.0.1)

### Support for hot reloading of LDAP credentials file

Since v2.0.0, LDAP credentials have been specified in a separate file. Starting with this version, the file is watched and changes applied without restarting zot.

### Bugfixes and performance improvements

Under some configurations, zot consumes significant CPU and memory resources. This has been fixed in this release.

## [v2.0.0](https://github.com/project-zot/zot/releases/tag/v2.0.0)

### Updated OCI support

- Support is added for [OCI Distribution Spec v1.1.0-rc3](https://github.com/opencontainers/distribution-spec/releases/tag/v1.1.0-rc3) and [OCI Image Spec v1.1.0-rc4](https://github.com/opencontainers/image-spec/releases/tag/v1.1.0-rc4). The OCI changes are summarized [here](https://opencontainers.org/posts/blog/2023-07-07-summary-of-upcoming-changes-in-oci-image-and-distribution-specs-v-1-1/).  These specifications allow arbitrary artifact types and references so that software supply chain use cases can be supported (SBOMs, signatures, etc). Currently, [`oras`](https://github.com/oras-project/oras) and [`regclient`](https://github.com/regclient/regclient) support this spec.

- For a demonstration of an end-to-end OCI artifacts workflow, see [Software Provenance Workflow Using OCI Artifacts](../articles/workflow.md).

    :warning:  Support is deprecated for earlier OCI release candidates.

### Built-in UI support

- Using the new zot [GUI](../user-guides/user-guide-gui.md), you can browse a zot registry for container images and artifacts. The web interface provides the shell commands for downloading an image using popular third-party tools such as docker, podman, and skopeo.

### Support for social logins

- Support is added for [OpenID authentication](../articles/authn-authz.md) with GitHub, Google, and dex.

### Group policies for authorization

- When creating authorization policies, you can assign multiple users to a named group. A [group-specific authorization policy](../articles/authn-authz.md) can then be defined, specifying allowed access and actions for the group.

    :pencil2:  &nbsp;**Configuration syntax change**: In the previous release, authorization policies were defined directly under the `accessControl` key in the zot configuration file.  With the new ability to create authorization groups, it becomes necessary to add a new `repositories` key below `accessControl`. Beginning with zot v2.0.0, the set of authorization policies are now defined under the `repositories` key.

### Signature verification

- The validity of an image's signature can be [verified](../articles/verifying-signatures.md) by zot. Users can upload public keys or certificates to zot.

### LDAP credentials stored separately from configuration

- The LDAP credentials are removed from zot's LDAP configuration and stored in a separate file. See zot's [LDAP documentation](../articles/authn-authz.md).

    :warning: This LDAP configuration change is incompatible with previous zot releases. When upgrading, you must reconfigure your LDAP credentials if you use LDAP.

### Storage deduplication on startup

- [Deduplication](../articles/storage.md), a storage space saving feature, now runs or reverts at startup depending on whether the feature is enabled or disabled. You can trigger deduplication by enabling it and then restarting zot.

### Retention policies

- To optimize image storage, you can configure [tag retention policies](../articles/retention.md) to remove images that are no longer needed.

### CVE scanning support for image indexes

- The `trivy` backend now supports vulnerability scanning of image indexes. Previously, only images were scanned.

### Bookmarks

- In the zot GUI, you can [bookmark](../user-guides/user-guide-gui.md#bookmarks) an image so that it can be easily found later. Bookmarked images appear in search queries when the bookmarked option is enabled.

### Ability to delete tags from the UI

### Command line search

- The [`zli search`](../user-guides/zli.md#_zli-search) command allows smart searching for a repository by its name or for an image by its repo:tag.

### Search by digest

- You can perform a global search for a digest (SHA hash) using either the UI or the CLI. This function is useful when an issue is found in a layer that is used by multiple images. In the UI Search box, for example, begin typing `sha256:` followed by a partial or complete digest value to see a dropdown list of images that contain the layer with the digest value.

### GraphQL support for search

- A [GraphQL backend server](../articles/graphql.md) within zot's registry search engine provides efficient and enhanced search capabilities. In addition to supporting direct GraphQL queries through the API, zot hosts the GraphQL Playground, which provides an interactive graphical environment for GraphQL queries.

### Scheduling of background tasks

- You can adjust the background scheduler based on your deployment requirements for tasks that are handled in the background, such as garbage collection.  See [Configuring zot](../admin-guide/admin-configuration.md).

### Performance profiling for troubleshooting

- You can use zot's [built-in profiling tools](../articles/pprofiling.md) to collect and analyze runtime performance data.

### Binaries for FreeBSD

- zot binary images are available for the [FreeBSD](https://www.freebsd.org/) operating system. Supported architectures are amd64 and arm64.

    :pencil2:  &nbsp;zot container images for FreeBSD will be available in a future release.

***

## [v1.4.3](https://github.com/project-zot/zot/releases/tag/v1.4.3)

### Remote-only Storage Support

- The two types of state (images and image metadata) can both now be on [remote storage](https://github.com/project-zot/zot/blob/v1.4.3/examples/config-all-remote.json) so that zot process lifecycle and its storage can be managed and scaled independently.

### Digest Collision Detection During Image Deletion

- When two or more image tags point to the same image digest and the image is deleted by digest causes data loss and dangling references. A new behavior-based [policy](https://github.com/project-zot/zot/blob/v1.4.3/examples/config-policy.json) called _detectManifestCollision_ was added to prevent this.

