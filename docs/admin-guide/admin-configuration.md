# Configuring `zot`

> :point_right: The registry administrator configures `zot` primarily through settings in the configuration file. 
> 
> Using the information in this guide, you can compose a configuration file with the settings and features you require for your `zot` registry server.
>
> Before launching `zot` with a new configuration, we recommend that you verify the syntax of your configuration as described in [Verifying the configuration file](#verifying-config).


## Configuration file

The configuration file is a JSON or YAML file that contains all configuration settings for `zot` functions such as:

-   network
-   storage
-   authentication
-   authorization
-   logging
-   metrics
-   synchronization with other registries
-   clustering

The `zot` service is initiated with the `zot serve` command followed by the name of a configuration file, as in this example:

`zot serve config.json`

> **Note:**
> The instructions and examples in this guide use `zot` as the name of the `zot` executable file. The examples do not include the path to the executable file.

When you first build `zot` or deploy an image or container from the distribution, a basic configuration file `config.json` is created. This initial file is similar to the following example:

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

With a full (not minimal) `zot` image, the additional extension features can be enabled and configured under an `extensions` attribute in the configuration file as shown in the following example.

``` json
{
  ...
  "extensions": {
    "metrics": {},
    "sync": {},
    "search": {},
    "scrub": {}
  }
}
```

> **Note:**
> The extension features are available only with a full `zot` image. With a minimal `zot` image, the `extensions` section is ignored if present.


The following features are configured under the `extensions` attribute.

-   [Metrics](admin-monitoring.md#metrics)

-   [Sync](#sync_config)

-   [Search](#search_config)

-   [Scrub](#scrub_config)

An extension feature is enabled by the presence of the feature’s
attribute under `extensions`. An extension feature can be disabled by
omitting the feature attribute or by including an `enable` attribute
with a value of `false`.

For example, the scrub feature is enabled in the following cases.

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

The scrub feature is disabled in the following cases.

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


<a name="network_config"></a>

## Network configuration

Use the `http` attribute in the configuration file to configure the
`zot` network settings, as shown in the following example.

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
| `address` | The IP address of the `zot` server.                                                                |
| `port`    | The port number of the `zot` server.                                                               |
| `realm`   | The security policy domain defined for the server.                                                          |
| `tls`     | The included attributes in this section specify the Transport Layer Security (TLS) settings for the server. |
| `cert`    | The path and filename of the server’s SSL/TLS certificate.                                                  |
| `key`     | The path and filename of the server’s registry key.                                                         |


<a name="storage_config"></a>

## Storage configuration

### Storage options

With `zot`, you have the option to store your registry image
files either in local filesystem storage or in cloud storage, such as an
Amazon Simple Storage Service (S3) bucket.

### Configuring local storage

Local filesystem storage for `zot` is configured with the
`storage` attribute in the configuration file, as shown in the following
example.

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

The following table lists the configurable attributes.

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 75%" />
</colgroup>
<thead>
<tr class="header">
<th style="text-align: left;">Attribute</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="text-align: left;"><p><code>rootDirectory</code></p></td>
<td style="text-align: left;"><p>Location of the images stored in the
server file system.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>commit</code></p></td>
<td style="text-align: left;"><p>For faster performance, data written by
`zot` is retained in memory before being periodically committed
to disk by the operating system. To eliminate this retention time and
cause data to be written to disk immediately, set to <code>true</code>.
This prevents data loss but reduces performance.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>dedupe</code></p></td>
<td style="text-align: left;"><p>If the server filesystem supports hard
links, you can optimize storage space by enabling inline deduplication
of layers and blobs that are shared among multiple container images.
Deduplication is enabled by default. Set to <code>false</code> to
disable deduplication.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>gc</code></p></td>
<td style="text-align: left;"><p>When an image is deleted, either by tag
or by reference, orphaned blobs can lead to wasted storage. Garbage
collection (gc) is enabled by default to reclaim this space. Set to
<code>false</code> to disable garbage collection.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>gcDelay</code></p></td>
<td style="text-align: left;"><p>(Optional) If garbage collection is
enabled, causes it to run once after the specified delay time. The
default is 1 hour. Requires the <code>gc</code> attribute to be
<code>true</code>.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>gcInterval</code></p></td>
<td style="text-align: left;"><p>(Optional) If garbage collection is
enabled, causes periodic collection at the specified interval. Must be
set based on use cases and user workloads. If no value is specified,
there is no periodic collection. Requires the <code>gc</code> attribute
to be <code>true</code>.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>subpaths</code></p></td>
<td style="text-align: left;"><p>You can store and serve images from
multiple filesystems, each with their own repository paths and settings.
The following example shows three subpaths.</p>
<div class="sourceCode" id="cb1"><pre
class="sourceCode json"><code class="sourceCode json"><span id="cb1-1"><a href="#cb1-1" aria-hidden="true" tabindex="-1"></a><span class="er">&quot;storage&quot;:</span><span class="fu">{</span></span>
<span id="cb1-2"><a href="#cb1-2" aria-hidden="true" tabindex="-1"></a>  <span class="dt">&quot;subPaths&quot;</span><span class="fu">:</span> <span class="fu">{</span></span>
<span id="cb1-3"><a href="#cb1-3" aria-hidden="true" tabindex="-1"></a>    <span class="dt">&quot;/a&quot;</span><span class="fu">:</span> <span class="fu">{</span></span>
<span id="cb1-4"><a href="#cb1-4" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;rootDirectory&quot;</span><span class="fu">:</span> <span class="st">&quot;/tmp/zot1&quot;</span><span class="fu">,</span></span>
<span id="cb1-5"><a href="#cb1-5" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;dedupe&quot;</span><span class="fu">:</span> <span class="kw">true</span><span class="fu">,</span></span>
<span id="cb1-6"><a href="#cb1-6" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;gc&quot;</span><span class="fu">:</span> <span class="kw">true</span></span>
<span id="cb1-7"><a href="#cb1-7" aria-hidden="true" tabindex="-1"></a>    <span class="fu">},</span></span>
<span id="cb1-8"><a href="#cb1-8" aria-hidden="true" tabindex="-1"></a>    <span class="dt">&quot;/b&quot;</span><span class="fu">:</span> <span class="fu">{</span></span>
<span id="cb1-9"><a href="#cb1-9" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;rootDirectory&quot;</span><span class="fu">:</span> <span class="st">&quot;/tmp/zot2&quot;</span><span class="fu">,</span></span>
<span id="cb1-10"><a href="#cb1-10" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;dedupe&quot;</span><span class="fu">:</span> <span class="kw">true</span></span>
<span id="cb1-11"><a href="#cb1-11" aria-hidden="true" tabindex="-1"></a>    <span class="fu">},</span></span>
<span id="cb1-12"><a href="#cb1-12" aria-hidden="true" tabindex="-1"></a>    <span class="dt">&quot;/c&quot;</span><span class="fu">:</span> <span class="fu">{</span></span>
<span id="cb1-13"><a href="#cb1-13" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;rootDirectory&quot;</span><span class="fu">:</span> <span class="st">&quot;/tmp/zot3&quot;</span><span class="fu">,</span></span>
<span id="cb1-14"><a href="#cb1-14" aria-hidden="true" tabindex="-1"></a>      <span class="dt">&quot;dedupe&quot;</span><span class="fu">:</span> <span class="kw">false</span></span>
<span id="cb1-15"><a href="#cb1-15" aria-hidden="true" tabindex="-1"></a>    <span class="fu">}</span></span>
<span id="cb1-16"><a href="#cb1-16" aria-hidden="true" tabindex="-1"></a>  <span class="fu">}</span></span>
<span id="cb1-17"><a href="#cb1-17" aria-hidden="true" tabindex="-1"></a><span class="fu">}</span></span></code></pre></div></td>
</tr>
</tbody>
</table>

### Configuring S3 storage

Amazon Simple Storage Service (S3) for `zot` can be configured
with the `storageDriver` attribute in the configuration file, as shown
in the following example:

``` json
"storageDriver": {
    "name": "s3",
    "region": "us-east-2",
    "bucket": "zot-storage",
    "secure": true,
    "skipverify": false,
    "accesskey": "<YOUR_ACCESS_KEY_ID>",
    "secretkey": "<YOUR_SECRET_ACCESS_KEY>"
}
```

As in the case with local filesystem storage, you can use multiple
storage locations using the `subpath` attribute, as in the following
example.

``` json
"subPaths": {
    "/a": {
        "rootDirectory": "/zot-a",
        "storageDriver": {
            "name": "s3",
            "region": "us-east-2",
            "bucket": "zot-storage",
            "secure": true,
            "skipverify": false
        }
    },
    "/b": {

...

    }
}
```

#### S3 Credentials

In the first configuration file example, the S3 credentials were
configured with the attributes `accesskey` and `secretkey.` As an
alternative, you can omit these attributes from the configuration file
and you can configure them using environment variables or a credential
file.

-   Environment variables

    `zot` looks for credentials in the following environment
    variables:

        AWS_ACCESS_KEY_ID
        AWS_SECRET_ACCESS_KEY
        AWS_SESSION_TOKEN (optional)

-   Credential file

    A credential file is a plaintext file that contains your access
    keys, as shown in the following example.

        [default]
        aws_access_key_id = <YOUR_DEFAULT_ACCESS_KEY_ID>
        aws_secret_access_key = <YOUR_DEFAULT_SECRET_ACCESS_KEY>

        [test-account]
        aws_access_key_id = <YOUR_TEST_ACCESS_KEY_ID>
        aws_secret_access_key = <YOUR_TEST_SECRET_ACCESS_KEY>

        [prod-account]
        ; work profile
        aws_access_key_id = <YOUR_PROD_ACCESS_KEY_ID>
        aws_secret_access_key = <YOUR_PROD_SECRET_ACCESS_KEY>

    The `[default]` heading defines credentials for the default profile,
    which `zot` will use unless you configure it to use another
    profile. You can specify a profile using the `AWS_PROFILE`
    environment variable as in this example:

        AWS_PROFILE=test-account

    The credential file must be named `credentials.` The file must be
    located in the `.aws/` folder in the home directory of the same
    server that is running your `zot` application.

For more details about specifying S3 credentials, see the [AWS
documentation](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials).


<a name="security_config"></a>

## Security and hardening

### Authentication

`zot` supports authentication by the following methods:

-   TLS mutual authentication

-   Basic local authentication using an htpasswd file

-   LDAP authentication

-   Bearer (OAuth2) authentication using an HTTP Bearer token

For detailed information about configuring authentication for your `zot`
registry, see [User Authentication and Authorization with zot](../articles/authn-authz.md).

### Identity-based authorization

User identity can be used as an authorization criterion for allowing
actions on one or more repository paths. For specific users, you can
choose to allow any combination of read, create, update, or delete
actions on specific repository paths.

For detailed information about configuring access control policies for
your `zot` registry, see [User Authentication and Authorization with
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
`zot` sends a failure notification to an authenticating user
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

For detailed information about configuring additional security features for your `zot` registry, see [Security Posture](../articles/security-posture.md).


<a name="monitor_config"></a>

## Monitoring

`zot` supports a range of monitoring tools including the following:

* Logging

    Logging for `zot` operations is configured with the `log` attribute in the configuration file.

*  Metrics

   Metrics data is available in a Prometheus format. A full `zot` image with extensions includes a node exporter. A minimal `zot` image can use an external node exporter such as `zxp`.

* Benchmarking

  The zot project includes the `zb` tool, which allows you to benchmark a `zot` registry or any other container image registry that conforms to the [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec).

For detailed information about the monitoring tools, see [Monitoring the registry](admin-monitoring.md).


<a name="cluster_config"></a>

## Clustering `zot`

To ensure high-availability of the registry,`zot` supports a clustering scheme with stateless `zot` instances/replicas fronted by a loadbalancer and a shared remote backend storage. This scheme allows the registry service to remain available even if a few replicas fail or become unavailable. Loadbalancing across many zot replicas can also increase aggregate network throughput.

For detailed information about clustering with `zot`, see [zot Clustering](../articles/clustering.md).


<a name="sync_config"></a>

## Syncing and mirroring registries

### Synchronizing registries

Add the `sync` attribute under `extensions` in the configuration file to enable and configure the periodic or on-demand synchronization of your `zot` image registry with other image registries, as shown in the following example.

``` json
"extensions": {
    "sync": {
        "enable": true,
        "credentialsFile": "./examples/sync-auth-filepath.json",
        "registries": [
        {
            "urls": [
                "https://registry1:5000"
            ],
            "onDemand": false,
            "pollInterval": "6h",
            "tlsVerify": true,
            "certDir": "/home/user/certs",
            "maxRetries": 5,
            "retryDelay": "10m",
            "onlySigned": true,
            "content": [
            {
                "prefix": "/repo1/repo",
                "tags":
                {
                    "regex": "4.*",
                    "semver": true
                }
            },
            {
                "prefix": "/repo1/repo",
                "destination": "/localrepo",
                "stripPrefix": true
            },
            {
                "prefix": "/repo1/**",
                "destination": "/localrepo",
                "stripPrefix": true
            },
            {
                "prefix": "/repo2/repo*"
            },
            {
                "prefix": "/repo3/**"
            }]
        },
        {
            "urls": [
                "https://registry2:5000",
                "https://registry3:5000"
            ],
            "pollInterval": "12h",
            "tlsVerify": false,
            "onDemand": false,
            "content": [
            {
                "prefix": "/repo2",
                "tags":
                {
                    "semver": true
                }
            }]
        },
        {
            "urls": [
                "https://docker.io/library"
            ],
            "onDemand": true,
            "tlsVerify": true,
            "maxRetries": 6,
            "retryDelay": "5m"
        }]
    }
}
```

The following table lists the configurable attributes for registry synchronization.

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 75%" />
</colgroup>
<thead>
<tr class="header">
<th style="text-align: left;">Attribute</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="text-align: left;"><p><code>enable</code></p></td>
<td style="text-align: left;"><p>If this attribute is missing, registry
synchronization is enabled by default. Registry synchronization can be
disabled by setting this attribute to <code>false</code>.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>credentialsFile</code></p></td>
<td style="text-align: left;"><p>The location of a local credentials
file containing credentials for other registries.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>urls</code></p></td>
<td style="text-align: left;"><p>The URL of an upstream image registry.
You can specify a comma-separated list of multiple URLs for the same
registry in case one or more fails.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>onDemand</code></p></td>
<td style="text-align: left;"><ul>
<li><p><code>false</code>: Pull all images not found in the local
registry.</p></li>
<li><p><code>true</code>: Pull any image not found in the local registry
only when needed.</p></li>
</ul></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>pollInterval</code></p></td>
<td style="text-align: left;"><p>The period in seconds between polling
of remote registries. If no value is specified, no periodic polling will
occur.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>tlsVerify</code></p></td>
<td style="text-align: left;"><ul>
<li><p><code>false</code>: TLS will not be verified.</p></li>
<li><p><code>true</code>: (Default) TLS will be verified.</p></li>
</ul></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>certDir</code></p></td>
<td style="text-align: left;"><p>If a path is specified, use
certificates at this path. If no path is specified, use the default
certificates directory.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>maxRetries</code></p></td>
<td style="text-align: left;"><p>The maximum number of retries if an
error occurs during either an on-demand or periodic synchronization. If
no value is specified, no retries will occur.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>retryDelay</code></p></td>
<td style="text-align: left;"><p>The interval in seconds between
retries. This attribute is mandatory when maxRetries is
configured.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>onlySigned</code></p></td>
<td style="text-align: left;"><ul>
<li><p><code>false</code>: Synchronize signed or unsigned
images.</p></li>
<li><p><code>true</code>: Synchronize only signed images (either notary
or cosigned).</p></li>
</ul></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>content</code></p></td>
<td style="text-align: left;"><p>The included attributes in this section
specify which content will be periodically pulled. If this section is
not populated, periodically polling will not occur. The included
attributes can also filter which on-demand images are pulled.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>prefix</code></p></td>
<td style="text-align: left;"><p>On the remote server, the path from
which images will be pulled. This path can be a string that exactly
matches the remote path, or it can be a <code>glob</code> pattern. For
example, the path can include a wildcard (<strong>*</strong>) or a
recursive wildcard (<strong>**</strong>).</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>destination</code></p></td>
<td style="text-align: left;"><p>Specifies the path under which pulled
images are to be stored.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>stripPrefix</code></p></td>
<td style="text-align: left;"><p>Specifies whether the prefix path from
the source registry will be retained or replaced when the image is
stored in the [zotLowerName] registry.</p>
<ul>
<li><p><code>false</code>: Retain the source prefix, append it to the
destination path.</p></li>
<li><p><code>true</code>: Remove the source prefix.</p>
<div class="note">
<p>Note: If the source prefix was specified with meta-characters (such as
<strong>**</strong>), only the prefix segments that precede the
meta-characters are removed. Any remaining path segments are appended to
the destination path.</p>
</div></li>
</ul></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>tags</code></p></td>
<td style="text-align: left;"><p>The included attributes in this
optional section specify how remote images will be selected for
synchronization based on image tags.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>regex</code></p></td>
<td style="text-align: left;"><p>Specifies a regular expression for
matching image tags. Images whose tags do not match the expression are
not pulled.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>semver</code></p></td>
<td style="text-align: left;"><p>Specifies whether image tags are to be
filtered by <a href="https://semver.org/">Semantic Versioning</a>
(semver) compliance.</p>
<ul>
<li><p><code>false</code>: Do not filter by semantic versioning</p></li>
<li><p><code>true</code>: Filter by semantic versioning</p></li>
</ul></td>
</tr>
</tbody>
</table>


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


<a name="search_config"></a>

## Enhanced searching and querying images

While basic searching is always enabled for images in the `zot` registry, you can enable enhanced registry searching and filtering using graphQL.

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


<a name="verifying-config"></a>

## Verifying the configuration file

Before launching `zot`, verify the syntax of your configuration
file using the following command:

`zot verify <configfile>`

> **Note:**
> Verifying the configuration file protects against operator errors and any conflicts arising from `zot` release version changes.


After verifying your configuration file, you can launch `zot` with the following command:

`zot serve <configfile>`