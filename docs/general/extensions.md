# Extensions

> Extensions provide additional registry features that are not a part of the Distribution Specification.
>
>The following extensions are currently available with `zot`:
>
> -   **Search (enhanced)**
> -   **Sync**
> -   **Lint**
> -   **Scrub**
> -  **Metrics**

## About extensions

The OCI Distribution Specification supports extending the functionality of an OCI-compliant registry implementation by adding [Extensions](https://github.com/opencontainers/distribution-spec/tree/main/extensions). Extensions are new APIs developed outside of the OCI project. Developers may propose their extensions to the OCI for possible future addition to the Distribution Specification.

Wherever applicable, extensions can be dynamically discovered using the extensions support of the OCI Distribution Specification. 

> **Note:**
> Extension features of `zot` are available only with a full `zot` image. They are not supported in a minimal `zot` image.

## Extensions implemented in zot

The following extensions are currently supported:

<a name="search"></a>

- **Search**

   One of the key functions of a container image registry (which is essentially a graph of blobs) is the ability to perform interesting image and graph traversal queries. The user interacts with the **search** extension via a graphQL endpoint. The schema is published with every release.

   Examples of queries are:

   -   "Does an image exist?"
   -   "What is its size?"
   -   "Does an image depend on this image via its layers?"
   -   "What vulnerabilities exist in an image or its dependent images?"

<a name="sync"></a>

- **Sync**

   You can deplay a local mirror pointing to an upstream `zot` instance with various container image download policies, including on-demand and periodic downloads. The **sync** function is useful to avoid overwhelming the upstream instance, or if the upstream instance has rate-limited access.

   > **Tip:**
   > `docker.io` is supported as an upstream mirror.

<a name="lint"></a>

- **Lint**

   The **lint** extension helps to avoid image compliance issues by enforcing certain policies about the image or the image metadata. Currently, **lint** can check an uploaded image to enforce the presence of required annotations such as the author or the license.

<a name="scrub"></a>

- **Scrub**

   Although container images are content-addressable with their SHA256 checksums, and validations are performed during storage and retrieval, it is possible that bit-rot sets in when not in use. The **scrub** extension actively scans container images in the background to proactively detect errors.

<a name="metrics"></a>

- **Metrics**
  
   The **metrics** extension adds a node exporter, which is not present in the minimal build.

For information about configuring `zot` extensions, see [*Configuring zot*](../admin-guide/admin-configuration.md).