# What's New

## [v2.0.0](https://github.com/project-zot/zot/releases/tag/v2.0.0)

### Updated OCI support

- Support is added for [OCI Distribution Spec v1.1.0-rc3](https://github.com/opencontainers/distribution-spec/releases/tag/v1.1.0-rc3) and [OCI Image Spec v1.1.0-rc4](https://github.com/opencontainers/image-spec/releases/tag/v1.1.0-rc4). The OCI changes are summarized [here](https://opencontainers.org/posts/blog/2023-07-07-summary-of-upcoming-changes-in-oci-image-and-distribution-specs-v-1-1/).

    :warning:  Support is deprecated for earlier OCI release candidates.

- Support is added for [OCI Artifacts and References](https://github.com/opencontainers/image-spec/blob/main/manifest.md#guidelines-for-artifact-usage). The OCI Image Spec v1.1.0 supports arbitrary artifact types and references so that software supply chain use cases can be supported (SBOMs, signatures, etc). Currently, [`oras`](https://github.com/oras-project/oras) and [`regclient`](https://github.com/regclient/regclient) support this spec.

- For a demonstration of an end-to-end OCI artifacts workflow, see [Software Provenance Workflow Using OCI Artifacts](../articles/workflow.md).

### Built-in UI support

- Using the new zot [GUI](../user-guides/user-guide-gui.md), you can browse a zot registry for container images and artifacts. The web interface provides the shell commands for downloading an image using popular third-party tools such as docker, podman, and skopeo.

### Support for social logins

- Support is added for [OpenID authentication](../articles/authn-authz.md) with GitHub, Google, and dex.

### Group policies for authorization

- When creating authorization policies, you can assign multiple users to a named group. A [group-specific authorization policy](../articles/authn-authz.md) can then be defined, specifying allowed access and actions for the group.

    :pencil2:  &nbsp;**Configuration syntax change**: In the previous release, authorization policies were defined directly under the `accessControl` key in the zot configuration file.  With the new ability to create authorization groups, it becomes necessary to add a new `repositories` key below `accessControl`. Beginning with zot v2.0.0, the set of authorization policies are now defined under the `repositories` key.

### Signature verification

- The validity of an image's signature can be [verified](../articles/verifying-signatures.md) by zot. Users can upload public keys or certificates to zot.

### Storage deduplication on startup

- [Deduplication](../articles/storage.md), a storage space saving feature, now runs or reverts at startup depending on whether the feature is enabled or disabled. You can trigger deduplication by enabling it and then restarting zot.

### Retention policies

- To optimize image storage, you can configure [tag retention policies](../articles/retention.md) to remove images that are no longer needed.

### CVE scanning support for image indexes

- The `trivy` backend now supports vulnerability scanning of image indexes. Previously, only images were scanned.

### Bookmarks

- In the zot GUI, you can [bookmark](../user-guides/user-guide-gui.md#bookmarks) an image so that it can be easily found later. Bookmarked images appear in search queries when the bookmarked option is enabled.

### Command line search

- The [`zli search`](../user-guides/zli.md#_zli-search) command allows smart searching for a repository by its name or for an image by its repo:tag.

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

