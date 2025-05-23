# What's New

## [v2.1.3](https://github.com/project-zot/zot/releases/tag/v2.1.3)

### Event generation

zot can now generate [registry-significant events](../articles/events.md) that can be published to http or nats endpoints.

### Improved `docker` Support in UI

Native docker images are now correctly displayed in the Web UI.

### Redis driver Support

Previous releases supported a local BoltDB or a remote DynamoDB database in
order to store image and blob metadata. This release now includes support for
[_Redis_](../articles/storage/#redis).

### AWS ECR Sync Support With Temporary Token Authentication

(AWS ECR)[../articles/mirroring/#example-support-for-aws-ecr] can now be used as the upstream registry to mirror from and the
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

