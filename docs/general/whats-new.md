# What's New

## [v1.4.3](https://github.com/project-zot/zot/releases/tag/v1.4.3)

### Support for [OCI Artifacts and References](https://github.com/opencontainers/image-spec/blob/main/artifact.md)

- The OCI Image Spec v1.1.0 supports arbitrary artifact types and references so that software supply chain use cases can be supported (SBOMs, signatures, etc). Currently, [`oras` v0.1.60](https://github.com/oras-project/oras/releases/tag/v0.16.0) and [`regclient`](https://github.com/regclient/regclient/releases/tag/v0.4.5) support this spec.

### Remote-only Storage Support

- The two types of state (images and image metadata) can both now be on [remote storage](https://github.com/project-zot/zot/blob/v1.4.3/examples/config-all-remote.json) so that `zot` process lifecycle and its storage can be managed and scaled independently.

### Digest Collision Detection During Image Deletion

- When two or more image tags point to the same image digest and the image is deleted by digest causes data loss and dangling references. A new behavior-based [policy](https://github.com/project-zot/zot/blob/v1.4.3/examples/config-policy.json) called _detectManifestCollision_ was added to prevent this.
