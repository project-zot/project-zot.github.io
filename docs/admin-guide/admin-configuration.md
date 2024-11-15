# Configuring zot

> :point_right: The registry administrator configures zot primarily through settings in the configuration file. 

Using the information in this guide, you can compose a configuration file with the settings and features you require for your zot registry server.

> :bulb: Before launching zot with a new configuration, we recommend that you verify the syntax of your configuration as described in [Verifying the configuration file](#verifying-config).


## Configuration file

The configuration file is a JSON or YAML file that contains all configuration settings for zot functions such as:

-   network
-   storage
-   authentication
-   authorization
-   logging
-   metrics
-   synchronization with other registries
-   
-   clustering

The zot service is initiated with the `zot serve` command followed by the name of a configuration file, as in this example:

`zot serve config.json`

> :pencil2:
> The instructions and examples in this guide use `zot` as the name of the zot executable file. The examples do not include the path to the executable file.

When you first build zot or deploy an image or container from the distribution, a basic configuration file `config.json` is created. This initial file is similar to the following example:

``` json
{
    "distSpecVersion": "1.0.1",
    "storage": {
        "rootDirectory": "/tmp/zot"
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

The configuration file contains the Distribution Specification version
(`distSpecVersion`). The structure and content of other attributes are
described in the later sections of this guide.


### Extensions

Additional registry features that are not a part of the Distribution Specification are allowed to be added as [Extensions](https://github.com/opencontainers/distribution-spec/tree/main/extensions).  

With a full (not minimal) zot image, the following extension features can be enabled and configured under an `extensions` attribute in the configuration file as shown in the following example.

``` json
{
  ...
  "extensions": {
    "metrics": {},
    "sync": {},
    "search": {},
    "scrub": {},
    "lint": {},
    "trust": {},
    "ui": {}
  }
}
```

> :warning:
> The extension features are available only with a full zot image. With a minimal zot image, the `extensions` section is ignored if present.


The following features are configured under the `extensions` attribute.

-   [Metrics](#monitor_config)
-   [Sync](#sync_config)
-   [Search](#search_config)
-   [Scrub](#scrub_config)
-   [Lint](#lint_config)
-   [ImageTrust](#trust_config)
-   [UI](#ui_config)
  
An extension feature is usually enabled by the presence of the feature’s attribute under `extensions`. An extension feature can then be disabled by either omitting the feature attribute or by including an `enable` attribute with a value of `false`.

> :pencil2: Two API-only extensions, [User Preferences](#userprefs_config) and [Mgmt](#mgmt_config), are not enabled or configured under the `extensions` section of the configuration file.  These API-only extensions are enabled as follows:
>
> - [Mgmt](#mgmt_config) is enabled when the `Search` extension is enabled.
>
> - [User Preferences](#userprefs_config) is enabled when both the `Search` and `UI` extensions are enabled. 

#### Enabling and disabling extensions

Following is an example of enabling or disabling a feature in the `extensions` section. The scrub feature is enabled in these two configurations:

``` json
"extensions": {
  "scrub": {}
}
```

``` json
"extensions": {
  "scrub": {
    "enable": true
  }
}
```

The scrub feature is disabled in these two configurations:

``` json
"extensions": {
}
```

``` json
"extensions": {
  "scrub": {
    "enable": false
  }
}
```

#### Developing custom extensions

New functionality can be added to the zot registry by developing custom extensions for integration into zot. For information about developing extensions, see [_Developing New Extensions_](../developer-guide/extensions-dev.md).


<a name="network_config"></a>

## Network configuration

Use the `http` attribute in the configuration file to configure the
zot network settings, as shown in the following example.

``` json
"http": {
  "address":"127.0.0.1",
  "port":"8080",
  "realm":"zot",
  "tls": {
    "cert":"test/data/server.cert",
    "key":"test/data/server.key"
  }
}
```

The following table lists the configurable attributes.

| Attribute | Description                                                                                                 |
|-----------|-------------------------------------------------------------------------------------------------------------|
| `address` | The IP address of the zot server.                                                                |
| `port`    | The port number of the zot server.                                                               |
| `realm`   | The security policy domain defined for the server.                                                          |
| `tls`     | The included attributes in this section specify the Transport Layer Security (TLS) settings for the server. |
| `cert`    | The path and filename of the server’s SSL/TLS certificate.                                                  |
| `key`     | The path and filename of the server’s registry key.                                                         |


<a name="storage_config"></a>

## Storage

Exposing flexibility in storage capabilities is a key tenet for catering to the requirements of varied environments ranging from cloud to on-premises to IoT.

Filesystem storage is configured with the `storage` attribute in the zot configuration file, as shown in the following simple example.

``` json
"storage":{
  "rootDirectory":"/tmp/zot",
  "commit": true,
  "dedupe": true,
  "gc": true,
  "gcDelay": "1h",
  "gcInterval": "24h"
}
```

With zot, you have the option to store your registry image files either in local filesystem storage or in cloud storage, such as an Amazon Simple Storage Service (S3) bucket.

### Local storage

zot can store and serve files from one or more local directories (folders). A minimum of one root directory is required for local hosting, but additional hosted directories can be added. When accessed by HTTP APIs, all directories can appear as a single data store.

> :pencil2:
> Remote filesystems that are mounted and accessible locally such as `NFS` or `fuse` are treated as local filesystems.

### Remote storage

zot can also store data remotely in the cloud, using the storage APIs of the cloud service. Currently, zot supports only the AWS S3 storage service.

For detailed information about configuring S3 storage, see the [AWS S3 documentation](https://docs.aws.amazon.com/s3/?icmpid=docs_homepage_featuredsvcs) and [Storage Planning with zot](../articles/storage.md).

### Storage features

#### Commit

Most modern filesystems buffer and flush RAM data to disk after a delay. The purpose of this function is to improve performance at the cost of higher disk memory usage. In embedded devices such as Raspberry Pi, for example, where RAM may be very limited and at a premium, it is desirable to flush data to disk more frequently. The zot storage configuration exposes an option called `commit` which, when enabled, causes data writes to be committed to disk immediately. This option is disabled by default.

#### Deduplication

Deduplication is a storage space saving feature wherein only a single copy of specific content is maintained on disk while many different image manifests may hold references to that same content. The deduplication option (`dedupe`) is also available for supported cloud storage backends.

Upon startup, zot enforces the `dedupe` status on the existing storage. If the `dedupe` status upon startup is `true`, zot deduplicates all blobs found in storage, both local and remote.  If the status upon startup is `false`, zot restores cloud storage blobs to their original state. There is no need for zot to restore local filesystem storage if hard links are used.

#### Garbage collection

After an image is deleted by deleting an image manifest, the corresponding blobs can be purged to free up space. However, since Distribution Specification APIs are not transactional between blob and manifest lifecycle, care must be taken so as not to put the storage in an inconsistent state. Garbage collection in zot is an inline feature meaning that it is **not** necessary to take the registry offline. The zot configuration model allows for enabling and disabling garbage collection (`gc`). The model also allows the configuration of a tunable delay (`gcDelay`), which can be set depending on client network speeds and the size of blobs.

#### Scrub

The `scrub` function, available as an *extension*, makes it possible to ascertain data validity by computing hashes on blobs periodically and continuously so that any bit rot is caught and reported early.

### Configuring storage

For detailed information about configuring local or remote storage and storage features for your zot registry, see [Storage Planning with zot](../articles/storage.md).


<a name="security_config"></a>

## Security and hardening

### Authentication

zot supports authentication by the following methods:

-   TLS mutual authentication

-   Basic local authentication using an htpasswd file

-   LDAP authentication

-   Bearer (OAuth2) authentication using an HTTP Bearer token

For detailed information about configuring authentication for your zot
registry, see [User Authentication and Authorization with zot](../articles/authn-authz.md).

### Identity-based authorization

User identity can be used as an authorization criterion for allowing
actions on one or more repository paths. For specific users, you can
choose to allow any combination of read, create, update, or delete
actions on specific repository paths.

For detailed information about configuring access control policies for
your zot registry, see [User Authentication and Authorization with
zot](../articles/authn-authz.md).

### Preventing automated attacks with failure delay

Use the `auth` and `failDelay` attributes under `http` in the
configuration file to delay the response to an authentication failure. A
delayed response helps to prevent automated attacks. The configuration
is shown in the following example.

``` json
"http": {
  "auth": {
    "failDelay": 5
  }
}
```

The `failDelay` attribute specifies a waiting time, in seconds, before
zot sends a failure notification to an authenticating user
who has been denied access.

### Rate limiting

You can limit the rate of API calls from users by configuring the
`Ratelimit` attribute in the configuration file, as shown in the
following example:

``` json
"http": {
    "address": "127.0.0.1",
    "port": "8080",
    "Ratelimit": {
        "Rate": 10,
        "Methods": [
            {
                "Method": "GET",
                "Rate": 5
            }
        ]
    }
}
```

In this example, the `Rate` attribute directly under `Ratelimit` sets a
global rate limit of ten API calls per second. You can optionally
override the global limit for specific API `Methods`. In this example,
API `GET` calls are limited to five per second.

### Additional security features

For detailed information about configuring additional security features for your zot registry, see [Security Posture](../articles/security-posture.md).


<a name="monitor_config"></a>

## Monitoring

zot supports a range of monitoring tools including the following:

* Logging

    Logging for zot operations is configured with the `log` attribute in the configuration file.

*  Metrics

    Metrics data is available in a Prometheus format. A full zot image with extensions includes a node exporter. A minimal zot image can use an external node exporter such as `zxp`.

* Benchmarking

    The zot project includes the `zb` tool, which allows you to benchmark a zot registry or any other container image registry that conforms to the [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec).

* Performance profiling

    Performance profiling capabilities within zot allow a zot [administrator](../articles/authn-authz.md) to collect and export a range of diagnostic performance data such as CPU intensive function calls, memory allocations, and execution traces. The collected data can then be analyzed using Go tools and a variety of available visualization tools.

When zot is deployed in a Kubernetes setup, a site reliability engineering (SRE) operator can monitor service level indicators (SLI) such as metrics and logs. Metrics will appear in [Prometheus](https://prometheus.io/docs/guides/query-log/) using the zot `metrics` extension, while logs will appear in the Elasticsearch stack ([ELK stack](https://www.elastic.co/what-is/elk-stack)) using [Filebeat](https://www.elastic.co/beats/filebeat).

For detailed information about the monitoring tools, see [Monitoring the registry](../articles/monitoring.md).

For detailed information about benchmarking, see [Benchmarking zot with zb](../articles/benchmarking-with-zb.md).

For detailed information about performance profiling, see [Performance Profiling in zot](../articles/pprofiling.md).

<a name="cluster_config"></a>

## Clustering zot

To ensure high-availability of the registry, zot supports a clustering scheme with stateless zot instances/replicas fronted by a loadbalancer and a shared remote backend storage. This scheme allows the registry service to remain available even if a few replicas fail or become unavailable. Loadbalancing across many zot replicas can also increase aggregate network throughput.

For detailed information about clustering with zot, see [zot Clustering](../articles/clustering.md).


<a name="sync_config"></a>

## Syncing and mirroring registries

A zot registry can mirror one or more upstream OCI registries, including popular cloud registries such as [Docker Hub](https://hub.docker.com/) and [Google Container Registry](https://cloud.google.com/artifact-registry).  If an upstream registry is OCI distribution-spec conformant for pulling images, you can use zot's `sync` extension feature to implement a downstream mirror, synchronizing OCI images and corresponding artifacts. Synchronization between registries can be implemented by periodic polling of the upstream registry or synchronization can occur on demand, when a user pulls an image from the downstream registry.

As with git, wherein every clone is a full repository, you can configure a local zot instance to be a full OCI mirror registry. This allows for a fully distributed disconnected container image build pipeline.

For detailed information about syncing and mirroring, see [OCI Registry Mirroring With zot](../articles/mirroring.md).


<a name="lint_config"></a>

## Linting uploaded images

The lint extension can check an uploaded image to enforce the presence of required annotations such as the author or the license.

To configure linting, add the `lint` attribute under `extensions` in the configuration file, as shown in the following example:

```json
"extensions": {
    "lint": {
      "enable": true,
      "mandatoryAnnotations": ["annot1", "annot2", "annot3"]
      }
  }
```

The following table lists the configurable attributes of the `lint` extension.

| Attribute  |Description  |
|------------|-------------|
| `enable`               | If this attribute is missing, incoming image linting is disabled by default. Linting can be enabled by including this attribute and setting it to `true`. |
| `mandatoryAnnotations` | A list of annotations that are required to be present in the image being pushed to the repository.  |

If the mandatory annotations option is configured when you push an image, linter will verify that the mandatory annotations list present in the configuration is also found in the manifest's annotations list. If any annotations are missing, the push is denied.


<a name="compat_config"></a>

## Compatibility with other image schema types

As an option, zot can be configured to store images using the schema [Docker Manifest v2 Schema v2](https://distribution.github.io/distribution/spec/manifest-v2-2/). In this case, a Docker image can be copied to zot without modifications to the image's manifest or digest. Such modifications would otherwise break the image's signature and attestations.

To enable this compatibility, configure the `compat` attribute under `http` in the zot configuration file. Set the `compat` value to `docker2s2` as shown in the following example:

```json
"http": {
    "address": "127.0.0.1",
    "port": "8080",
    "compat": ["docker2s2"]
}
```


<a name="trust_config"></a>

## Verifying the signatures of uploaded images

The `trust` extension provides a mechanism to verify image signatures using certificates and public keys.

To enable image signature verification, you must add the `trust` attribute under `extensions` in the zot configuration file and enable one or more verification tools, as shown in the following example:

```json
"extensions": {
  "trust": {
    "enable": true,
    "cosign": true,
    "notation": true
  }
}
```

You must also upload public keys (for `cosign`) or certificates (for `notation`) that can be used to verify the image signatures.  

For detailed information about configuring image signature verification, see [Verifying image signatures](../articles/verifying-signatures.md).


<a name="ui_config"></a>

## Enabling the registry's graphical user interface

Using the zot [graphical user interface (GUI)](../user-guides/user-guide-gui.md), a user can browse a zot registry for container images and artifacts.

To configure zot's GUI, add the `ui` attribute under `extensions` in the configuration file, as shown in the following example:

```json
"extensions": {
  "ui": {
    "enable": true
  }
}
```

The following table lists the configurable attributes of the `ui` extension.

| Attribute  |Description  |
|------------|-------------|
| `enable`   | If this attribute is missing, the zot GUI is disabled by default. The GUI can be enabled by including this attribute and setting it to `true`. |


<a name="scrub_config"></a>

## Scrubbing the image registry

To check the integrity of the filesystem and the data in the registry, you can schedule a periodic scrub operation. The scrub process traverses the filesystem, verifying that all data blocks are readable. While running, the process may slightly reduce the registry performance.

To enable scrubbing, add the `scrub` attribute under `extensions` in the configuration file, as shown in the following example:

``` json
"extensions": {
  "scrub": {
    "enable": true,
    "interval": "24h"
  }
}
```

The following table lists the configurable attributes for scrubbing the registry.

| Attribute  | Description                                                                                                                             |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `enable`   | If this attribute is missing, registry scrubbing is enabled by default. Scrubbing can be disabled by setting this attribute to `false`. |
| `interval` | The time interval between periodic scrub operations. This value must be at least two hours (`2h`).                                      |


<a name="background_config"></a>

## Scheduling background tasks

Some zot functions, such as garbage collection and registry synchronization, run as background tasks. These tasks are queued and executed by the scheduler. 

The scheduler is by default allowed to simultaneously run a maximum number of tasks equal to four times the number of CPUs available to the zot process. For most users, there should be no need to modify this maximum number. If such a need arises, you can configure a new maximum number of simultaneous tasks in the `numWorkers` property of the `scheduler` attribute in the configuration file, as shown in the following example.

``` json
{
  "distSpecVersion": "1.1.0-dev",
  "scheduler": {
    "numWorkers": 3
  },
...
}
```

<a name="search_config"></a>

## Enhanced searching and querying images

While basic searching is always enabled for images in the zot registry, you can enable enhanced registry searching and filtering using graphQL.

Add the `search` attribute under `extensions` in the configuration file to enable and configure the enhanced search extension, as shown in the following example.

``` json
"extensions": {
  "search": {
    "enable": true,
    "cve": {
      "updateInterval": "2h"
    }
  }
}
```

The following table lists the configurable attributes for enhanced search.

| Attribute        | Description                                                                                                                                |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `enable`         | If this attribute is missing, enhanced search is enabled by default. Enhanced search can be disabled by setting this attribute to `false`. |
| `cve`            | Extends enhanced search to allow searching of Common Vulnerabilities and Exposures (CVE).                                                  |
| `updateInterval` | Sets the interval at which the searchable database of CVE items is refreshed.                                                              |

<a name="userprefs_config"></a>

## Setting user preferences

The user preferences extension provides an API endpoint for adding configurable user preferences for a repository. This custom extension, not a part of the OCI distribution, is accessible only by authenticated users of the registry. Unauthenticated users are denied access.

The user preferences extension is enabled by default when the `search` and `ui` extensions are enabled. There are no other configuration file fields for this extension.

A `userprefs` API endpoint accepts as a query parameter an `action` to perform along with any other required parameters for the specified action. The actions currently implemented do not require an HTTP payload, nor do they return any related data other than an HTTP response code.

### Current functionality

The current functions implemented by this extension include:

- Toggling the star (favorites) icon for a repository.
- Toggling the bookmark icon for a repository.

#### Toggle repository star

This action sets the repository star property to `true` if it is `false`, and to `false` if it is `true`.

| Action | Parameter | Parameter Description |
| --- | --- | --- |
| toggleStar | repo | The name of the repository whose star is to be changed |

This example toggles a star on a repository named repoName:

```
PUT
http://localhost:5000/v2/_zot/ext/userprefs?
action=toggleStar&repo=repoName
```

#### Toggle repository bookmark

This action sets the repository bookmark property to `true` if it is `false`, and to `false` if it is `true`.

| Action | Parameter | Parameter Description |
| --- | --- | --- |
| toggleBookmark | repo | The name of the repository whose bookmark is to be changed |

This example toggles a bookmark on a repository named repoName:

```
PUT
http://localhost:5000/v2/_zot/ext/userprefs?
action=toggleBookmark&repo=repoName
```

<a name="verifying-config"></a>

## Verifying the configuration file

Before launching zot, verify the syntax of your configuration
file using the following command:

`zot verify <configfile>`

> :pencil2:
> Verifying the configuration file protects against operator errors and any conflicts arising from zot release version changes.


After verifying your configuration file, you can launch zot with the following command:

`zot serve <configfile>`
