# Storage Planning with zot

> :point_right: `zot` supports the following features to provide OCI standards-based, vendor-agnostic image storage:
>
> -   Local and remote file storage
> -   Inline deduplication and garbage collection
> -   Data scrubbing in background


## Storage model

Data handling in `zot` revolves around two main principles: that data and APIs on the wire conform to the OCI Distribution Specification and that data on the disk conforms to the OCI Image Layout Specification. As a result, any client that is compliant with the Distribution Specification can read from or write to a `zot` registry. Furthermore, the actual storage is simply an OCI Image Layout. With only these two specification documents in hand, the entire data flow inside can be easily understood.

> **Note:**
> `zot` does not implement, support, or require any vendor-specific protocols, including that of Docker.

### Hosting an OCI image layout

Because `zot` supports the OCI image layout, it can readily host and serve any directories holding a valid OCI image layout even when those directories have been created elsewhere. This property of `zot` is suitable for use cases in which container images are independently built, stored, and transferred, but later need to be served over the network.

## Storage backends

The following types of storage backends are supported.

### Local filesystem

`zot` can store and serve files from one or more local directories (folders). A minimum of one root directory is required for local hosting, but additional hosted directories can be added. When accessed by HTTP APIs, all directories can appear as a single data store.

> **Note:**
> Remote filesystems that are mounted and accessible locally such as `NFS` or `fuse` are treated as local filesystems.


### Remote filesystem

`zot` can also store data remotely in the cloud, using the storage APIs of the cloud service. Currently, `zot` supports only the AWS S3 storage service.

#### Example: zot S3 configuration

<details>
  <summary markdown="span">Click here to view a sample zot configuration for S3.</summary>

```json

{
    "distSpecVersion": "1.0.1-dev",
    "storage": {
        "rootDirectory": "/tmp/zot",
        "dedupe": true,
        "storageDriver": {
            "name": "s3",
            "rootdirectory": "/zot",
            "region": "us-east-2",
            "bucket": "zot-storage",
            "secure": true,
            "skipverify": false
        },
        "cacheDriver": {
            "name": "dynamodb",
            "endpoint": "http://localhost:4566",
            "region": "us-east-2",
            "tableName": "MainTable"
        },
    },
    "http": {
        "address": "127.0.0.1",
        "port": "8080"
    },
    "log": {
        "level": "debug"
    }
}

```
</details>


## Storage configuration

Exposing flexibility in storage capabilities is a key tenet for catering to the requirements of varied environments ranging from cloud to on-premises to IoT.

### Commit

Most modern filesystems buffer and flush RAM data to disk after a delay. The purpose of this function is to improve performance at the cost of higher disk memory usage. In embedded devices such as Raspberry Pi, for example, where RAM may be very limited and at a premium, it is desirable to flush data to disk more frequently. The `zot` storage configuration exposes an option called `commit` which, when enabled, causes data
writes to be committed to disk immediately. This option is disabled by default.

### Deduplication

Deduplication is a storage space saving feature wherein only a single copy of specific content is maintained on disk while many different image manifests may hold references to that same content. The deduplication feature is also available for supported cloud storage backends.

### Garbage collection

After an image is deleted by deleting an image manifest, the corresponding blobs can be purged to free up space. However, since Distribution Specification APIs are not transactional between blob and manifest lifecycle, care must be taken so as not to put the storage in an inconsistent state. Garbage collection in `zot` is an inline feature meaning that it is **not** necessary to take the registry offline. The `zot` configuration model allows for enabling and disabling garbage collection. The model also allows the configuration of a tunable delay, which can be set depending on client network speeds and the size of blobs.

### Scrub

The scrub function, available as an *extension*, makes it possible to ascertain data validity by computing hashes on blobs periodically and continuously so that any bit rot is caught and reported early.
