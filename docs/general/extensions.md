# Extensions

> :point_right: Extensions provide additional registry features that are not a part of the Distribution Specification.

The following extensions are currently available with zot:

-  **Search (enhanced)**
-  **Sync**
-  **Lint**
-  **Scrub**
-  **Trust**
-  **Metrics**
-  **Graphical user interface**
-  **User preferences**


> :bulb: For detailed information about configuring zot extensions, see [*Configuring zot*](../admin-guide/admin-configuration.md).

## About extensions

The OCI Distribution Specification supports extending the functionality of an OCI-compliant registry implementation by adding [extensions](https://github.com/opencontainers/distribution-spec/tree/main/extensions). Extensions are new APIs developed outside of the core OCI specs. Developers may propose their extensions to the OCI for possible future addition to the Distribution Specification.

Wherever applicable, extensions can be dynamically discovered using the extensions support of the OCI Distribution Specification.

> :warning:
> Extension features of zot are available only with a full zot image. They are excluded from the minimal zot image.

## Extensions implemented in zot

The extensions implemented in zot include administrator-configured functionality and end-user features. 

> :pencil2: Currently, _search_, _trust_, and _userprefs_ are the only zot extensions operable by end users. Only these extensions are accessible through HTTP APIs and are [discoverable](https://github.com/opencontainers/distribution-spec/blob/main/extensions/_oci.md#module-discover) using the OCI extensions mechanism.

The following extensions are currently supported by zot:

### **Search**

   One of the key functions of a container image registry (which is essentially a graph of blobs) is the ability to perform interesting image and graph traversal queries. The user interacts with the **search** extension via a graphQL endpoint. The schema is published with every release.

   Examples of queries are:

   -   "Does an image exist?"
   -   "What is its size?"
   -   "Does an image depend on this image via its layers?"
   -   "What vulnerabilities exist in an image or its dependent images?"

### **Sync**

   You can deploy a local mirror pointing to an upstream zot instance with various container image download policies, including on-demand and periodic downloads. The **sync** function is useful to avoid overwhelming the upstream instance, or if the upstream instance has rate-limited access.

> :bulb:
> `docker.io` is supported as an upstream mirror.

### **Lint**

   The **lint** extension helps to avoid image compliance issues by enforcing certain policies about the image or the image metadata. Currently, **lint** can check an uploaded image to enforce the presence of required annotations such as the author or the license.

### **Scrub**

   Although container images are content-addressable with their SHA256 checksums, and validations are performed during storage and retrieval, it is possible that bit-rot sets in when not in use. The **scrub** extension actively scans container images in the background to proactively detect errors.

### **Trust**

   Images stored in zot can be signed with a digital signature to verify the source and integrity of the image. The digital signature can be verified by zot using public keys or certificates uploaded by the user through the zot API. The **trust** extension enables and configures this function.

### **Metrics**
  
   The **metrics** extension adds a node exporter, which is not present in the minimal build.

### **Graphical user interface**

   Using the zot [graphical user interface (GUI)](../user-guides/user-guide-gui.md), you can browse a zot registry for container images and artifacts. From the web interface, you can copy the shell commands for downloading an image using popular third-party tools such as docker, podman, and skopeo.

### **User preferences**

   The **userprefs** extension provides an API endpoint for adding configurable user preferences for a repository. This custom extension, not a part of the OCI distribution, is accessible only by authenticated users of the registry. Unauthenticated users are denied access.

   The functions currently implemented by this extension include:

   - Toggling the star (favorites) icon for a repository.
   - Toggling the bookmark icon for a repository.

> :bulb: For information about configuring zot extensions, see [*Configuring zot*](../admin-guide/admin-configuration.md).
