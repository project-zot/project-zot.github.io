# What's New

## [v2.0.0](https://github.com/project-zot/zot/releases/tag/v2.0.0)

### Updated OCI support

- Support is added for [OCI Distribution Spec v1.1.0-rc3](https://github.com/opencontainers/distribution-spec/releases/tag/v1.1.0-rc3) and [OCI Image Spec v1.1.0-rc4](https://github.com/opencontainers/image-spec/releases/tag/v1.1.0-rc4).

    :pencil2:  Support is deprecated for earlier release candidates.

### Built-in UI support

- Using the new zot [GUI](../user-guides/user-guide-gui.md), you can browse a zot registry for container images and artifacts. The web interface provides the shell commands for downloading an image using popular third-party tools such as Docker, podman, and skopeo.

### Command line search

- The [`zli search`](../user-guides/zli.md#_zli-search) command allows smart searching for a repository by its name or for an image by its repo:tag.

### Bookmarks

- In the zot GUI, you can [bookmark](../user-guides/user-guide-gui.md#bookmarks) an image so that it can be easily found later. Bookmarked images appear in search queries when the bookmarked option is enabled.

### Group policies for authorization

- When creating authorization policies, you can assign multiple users to a named group. A [group-specific authorization policy](../articles/authn-authz.md) can then be defined, specifying allowed access and actions for the group.

### Signature verification

- The validity of an image's signature can be [verified](../articles/verifying-signatures.md) by zot. Users can upload public keys or certificates to zot using the new [`mgmt` extension](../general/extensions.md) of the zot API.

### Storage deduplication on demand on startup

- [Deduplication](../articles/storage.md), a storage space saving feature, now runs or reverts at startup depending on whether the feature is enabled or disabled. You can trigger deduplication by enabling it and then restarting zot.


## [v1.4.3](https://github.com/project-zot/zot/releases/tag/v1.4.3)

### Support for [OCI Artifacts and References](https://github.com/opencontainers/image-spec/blob/main/artifact.md)

- The OCI Image Spec v1.1.0 supports arbitrary artifact types and references so that software supply chain use cases can be supported (SBOMs, signatures, etc). Currently, [`oras`](https://github.com/oras-project/oras/releases/tag/v0.16.0) and [`regclient`](https://github.com/regclient/regclient/releases/tag/v0.4.5) support this spec.

### Remote-only Storage Support

- The two types of state (images and image metadata) can both now be on [remote storage](https://github.com/project-zot/zot/blob/v1.4.3/examples/config-all-remote.json) so that zot process lifecycle and its storage can be managed and scaled independently.

### Digest Collision Detection During Image Deletion

- When two or more image tags point to the same image digest and the image is deleted by digest causes data loss and dangling references. A new behavior-based [policy](https://github.com/project-zot/zot/blob/v1.4.3/examples/config-policy.json) called _detectManifestCollision_ was added to prevent this.
