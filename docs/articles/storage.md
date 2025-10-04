# Storage Planning with zot

> :point_right: zot supports the following features to provide OCI standards-based, vendor-agnostic image storage:
>
> -   Local and remote file storage
> -   Inline deduplication and garbage collection
> -   Data scrubbing in background

## Storage model

Data handling in zot revolves around two main principles: that data and APIs on the wire conform to the OCI Distribution Specification and that data on the disk conforms to the OCI Image Layout Specification. As a result, any client that is compliant with the Distribution Specification can read from or write to a zot registry. Furthermore, the actual storage is simply an OCI Image Layout. With only these two specification documents in hand, the entire data flow inside can be easily understood.

> :pencil2:
> zot does not implement, support, or require any vendor-specific protocols, including that of Docker.

### Hosting an OCI image layout

Because zot supports the OCI image layout, it can readily host and serve any directories holding a valid OCI image layout even when those directories have been created elsewhere. This property of zot is suitable for use cases in which container images are independently built, stored, and transferred, but later need to be served over the network.

## Storage features

Exposing flexibility in storage capabilities is a key tenet for catering to the requirements of varied environments ranging from cloud to on-premises to IoT.

#### Commit

Most modern filesystems buffer and flush RAM data to disk after a delay. The purpose of this function is to improve performance at the cost of higher disk memory usage. In embedded devices such as Raspberry Pi, for example, where RAM may be very limited and at a premium, it is desirable to flush data to disk more frequently. The zot storage configuration exposes an option called `commit` which, when enabled, causes data writes to be committed to disk immediately. This option is disabled by default.

#### Deduplication

Deduplication is a storage space saving feature wherein only a single copy of specific content is maintained on disk while many different image manifests may hold references to that same content. The deduplication option (`dedupe`) is also available for supported cloud storage backends.

Upon startup, zot enforces the `dedupe` status on the existing storage. If the `dedupe` status upon startup is `true`, zot deduplicates all blobs found in storage, both local and remote.  If the status upon startup is `false`, zot restores cloud storage blobs to their original state. There is no need for zot to restore local filesystem storage if hard links are used.

#### Garbage collection

After an image is deleted by deleting an image manifest, the corresponding blobs can be purged to free up space. However, since Distribution Specification APIs are not transactional between blob and manifest lifecycle, care must be taken so as not to put the storage in an inconsistent state. Garbage collection in zot is an inline feature meaning that it is **not** necessary to take the registry offline. See <a href="#config-gc"><i>Configuring garbage collection</i></a> for details.

#### Scrub

The `scrub` function, available as an *extension*, makes it possible to ascertain data validity by computing hashes on blobs periodically and continuously so that any bit rot is caught and reported early.

## Storage backends

The following types of storage backends are supported.

### Local filesystem

zot can store and serve files from one or more local directories. A minimum of one root directory is required for local hosting, but additional hosted directories can be added. When accessed by HTTP APIs, all directories can appear as a single data store.

> :pencil2:
> Remote filesystems that are mounted and accessible locally such as `NFS` or `fuse` are treated as local filesystems.


### Remote filesystem

zot can also store data remotely in the cloud, using the storage APIs of the cloud service. Currently, zot supports only the AWS s3 storage service.

#### Example: configuration for remote (s3) storage

<details>
  <summary markdown="span">Click here to view a sample zot configuration for remote storage.</summary>

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


## Configuring zot storage

Filesystem storage is configured with the `storage` attribute in the zot configuration file, as shown in the following example.

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

### Configurable attributes

The following table lists the attributes of the `storage` configuration.

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
zot is retained in memory before being periodically committed
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
or by digest, orphaned blobs can lead to wasted storage. Garbage
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
<tr class="even">
<td style="text-align: left;"><p><code>storageDriver</code></p></td>
<td style="text-align: left;"><p>(Remote storage only) Contains settings for a remote storage service. See <a href="#config-s3"><i>Configuring remote storage with s3</i></a> for details.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>cacheDriver</code></p></td>
<td style="text-align: left;"><p>Specifies which database is used to store duplicate blobs when deduplication is enabled. See <a href="#config-cache"><i>Cache drivers</i></a> for details.</p></td></p></td>
</tr>
</tbody>
</table>


<a name="config-gc"></a>

### Configuring garbage collection

The zot configuration model allows for enabling and disabling garbage collection (`gc`) and specifying a periodic interval (`gcInterval`) for collection.

| `gc`      | `gcInterval` | Result  |
| --------- | ------------ | ------ |
| false     | n/a          | GC disabled |
| omitted   | n/a          | GC enabled with 1 hour interval (default) |
| true      | omitted      | GC enabled with 1 hour interval |
| true      |  0           | GC runs only once |
| true      |  >0          | GC enabled with specified interval |

The configuration model also allows the configuration of a tunable delay (`gcDelay`), which can be set depending on client network speeds and the size of blobs. The `gcDelay` attribute causes collection to run once after the specified delay time.  This attribute has a default value of one hour (`1h`).

By default, if `retention` is not configured, garbage collection deletes all untagged manifests which are not referenced by indexes or artifacts after the `gcDelay` passes.
This delay can we overwritten using a separate setting if `retention` is configured, for more details see the retention configuration article.

<a name="config-s3"></a>

## Configuring remote storage with s3

To configure an Amazon Simple Storage Service (s3) bucket for zot, use the `storageDriver` attribute in the zot configuration file, as shown in the following example:

``` json
    "storage": {
        "rootDirectory": "/tmp/zot",
        "storageDriver": {
            "name": "s3",
            "region": "us-east-2",
            "bucket": "zot-storage",
            "secure": true,
            "skipverify": false,
            "accesskey": "<YOUR_ACCESS_KEY_ID>",
            "secretkey": "<YOUR_SECRET_ACCESS_KEY>"
        }
    }
```

The following table lists the attributes of `storageDriver` when configuring s3 for remote storage:

| Attribute                   | Required | Description                                                                                                                        |
|-----------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------|
| name                        | yes      | Name of storage driver. Only `s3` is supported for now.                                                                            |
| accesskey                   | no       | Your AWS Access Key. If you use IAM roles, omit to fetch temporary credentials from IAM.                                           |
| secretkey                   | no       | Your AWS Secret Key. If you use IAM roles, omit to fetch temporary credentials from IAM.                                           |
| region                      | yes      | The AWS region in which your bucket exists.                                                                                        |
| regionendpoint              | no       | Endpoint for S3 compatible storage services (Minio, etc).                                                                          |
| forcepathstyle              | no       | To enable path-style addressing when the value is set to true. The default is true.                                                |
| bucket                      | yes      | The bucket name in which you want to store the registry’s data.                                                                    |
| encrypt                     | no       | Specifies whether the registry stores the image in encrypted format or not. A boolean value. The default is false.                 |
| keyid                       | no       | Optional KMS key ID to use for encryption (encrypt must be true, or this parameter is ignored). The default is none.               |
| secure                      | no       | Indicates whether to use HTTPS instead of HTTP. A boolean value. The default is true.                                              |
| skipverify                  | no       | Skips TLS verification when the value is set to true. The default is false.                                                        |
| v4auth                      | no       | Indicates whether the registry uses Version 4 of AWS’s authentication. The default is true.                                        |
| chunksize                   | no       | The S3 API requires multipart upload chunks to be at least 5MB. This value should be a number that is larger than 5 * 1024 * 1024. |
| multipartcopychunksize      | no       | Default chunk size for all but the last S3 Multipart Upload part when copying stored objects.                                      |
| multipartcopymaxconcurrency | no       | Max number of concurrent S3 Multipart Upload operations when copying stored objects.                                               |
| multipartcopythresholdsize  | no       | Default object size above which S3 Multipart Upload will be used when copying stored objects.                                      |
| rootdirectory               | no       | This is a prefix that is applied to all S3 keys to allow you to segment data in your bucket if necessary.                          |
| storageclass                | no       | The S3 storage class applied to each registry file. The default is STANDARD.                                                       |
| useragent                   | no       | The User-Agent header value for S3 API operations.                                                                                 |
| usedualstack                | no       | Use AWS dual-stack API endpoints.                                                                                                  |
| accelerate                  | no       | Enable S3 Transfer Acceleration.                                                                                                   |
| objectacl                   | no       | The S3 Canned ACL for objects. The default value is “private”.                                                                     |
| loglevel                    | no       | The log level for the S3 client. The default value is off.                                                                         |

For more information, see the [s3 storage driver docs](https://distribution.github.io/distribution/storage-drivers/s3/).

### s3 Credentials

In the s3 configuration file example, the s3 credentials were configured with the attributes `accesskey` and `secretkey.` As an alternative, you can omit these attributes from the configuration file and you can configure them using environment variables or a credential file.

-   Environment variables

    zot looks for credentials in the following environment
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
    which zot will use unless you configure it to use another
    profile. You can specify a profile using the `AWS_PROFILE`
    environment variable as in this example:

        AWS_PROFILE=test-account

    The credential file must be named `credentials.` The file must be
    located in the `.aws/` subdirectory in the home directory of the same
    server that is running your zot application.

For more details about specifying s3 credentials, see the [AWS documentation](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials).

### S3 permissions scopes

The following AWS policy is required by zot for push and pull.

> :pencil2: Replace S3_BUCKET_NAME with the name of your s3 bucket.

```json
[AWS CONFIGURATION]
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:ListBucketMultipartUploads"
      ],
      "Resource": "arn:aws:s3:::<S3_BUCKET_NAME>"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListMultipartUploadParts",
        "s3:AbortMultipartUpload"
      ],
      "Resource": "arn:aws:s3:::<S3_BUCKET_NAME>/*"
    }
  ]
}
```

For more details about configuring AWS policies, see the [AWS documentation](https://docs.aws.amazon.com/index.html).

<a name="config-cache"></a>

## Cache drivers

A cache driver is used to store duplicate blobs when `dedupe` is enabled.  zot supports database caching using BoltDB as the cache driver for local filesystems and DynamoDB and Redis for remote filesystems.

### BoltDB

If you don't specify a cache driver, zot defaults to [BoltDB](https://dbdb.io/db/boltdb).  BoltDB is stored either in zot's root directory or in the subpath root directory.

```json
    "storage": {
        "rootDirectory": "/tmp/zot",
        "dedupe": true
    }
```

In this example, BoltDB can be found at /tmp/zot/cache.db.

> :warning:
> Because BoltDB does not provide concurrent access for writes, multiple instances/replicas of zot are not supported with a BoltDB configuration.

### DynamoDB

To use [DynamoDB](https://aws.amazon.com/dynamodb/) as the cache driver, the following storage configuration must be present:

- `dedupe` is enabled
- `remoteCache` is enabled
- `cacheDriver` attribute is configured as in the following example:

```json
    "storage": {
        "rootDirectory": "/tmp/zot",
        "dedupe": true,
        "remoteCache": true,
        "cacheDriver": {
            "name": "dynamodb",                  // driver name
            "endpoint": "http://localhost:4566", // aws endpoint
            "region": "us-east-2",               // aws region
            "cacheTablename": "ZotBlobTable"     // table to store deduped blobs
        }
    },
```

The AWS GO SDK loads additional configuration and credentials values from your environment variables, shared credentials, and shared configuration files.

If the search extension is enabled, additional parameters are required:

```json
        "cacheDriver": {
            "name": "dynamodb",
            "endpoint": "http://localhost:4566",
            "region": "us-east-2",
            "cacheTablename": "ZotBlobTable",
            // used by auth
            "userDataTablename": "ZotUserDataTable",
            "apiKeyTablename": "ZotApiKeyDataTable",
            // used by search extension
            "repoMetaTablename": "ZotRepoMetadataTable",
            "imageMetaTablename": "ZotImageMetaTable",
            "repoBlobsInfoTablename": "ZotRepoBlobsInfoTable",
            "versionTablename": "ZotVersion"
        }
```

#### DynamoDB permission scopes

The following AWS policy is required by zot for caching blobs.

> :pencil2: Replace DYNAMODB_TABLE with the name of your table, which should be the value of `cacheTablename` in the zot configuration.
>
> In this case, the AWS `Resource` value would be `arn:aws:dynamodb:*:*:table/ZotBlobTable`

```json
[AWS CONFIGURATION]
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DescribeTable",
        "dynamodb:DeleteTable",
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/<DYNAMODB_TABLE>"
    }
  ]
}
```

Note `dynamodb:DeleteTable` is used only in running the zot tests, should not be needed in production.

For more details about configuring AWS DynamoDB, see the [AWS documentation](https://docs.aws.amazon.com/dynamodb/).

### Redis

[Redis](https://redis.io/) is an alternative to BoltDB (which cannot be shared by multiple zot instances) and DynamoDB (which requires access to AWS).

To use Redis as the cache driver, the following storage configuration must be present:

- `remoteCache` is enabled
- `cacheDriver` attribute is configured as in the following example:

```json
    "storage": {
        "rootDirectory": "/tmp/zot",
        "remoteCache": true,
        "cacheDriver": {
            "name": "redis",
            "url": "redis://localhost:6379",
            "keyprefix": "zot"
        }
    },
```

The cache driver name `redis` selects the Redis driver implementation.

The key `keyprefix` is a string prepended to all Redis keys created by this zot instance. If no string is specified, the default value is `zot`.
If multiple zot instances share the same Redis database and storage, `keyprefix` should be the same in all their configurations.
If multiple zot instances share the same Redis database, but have different storage locations containing different images, `keyprefix` should be different in all their configurations.

The `url` string can contain query parameters for various settings, and it can be used for both Redis single instance and cluster configurations.
More details on how `url` is parsed are available at:
- https://github.com/redis/go-redis/blob/v9.7.0/options.go#L247
- https://github.com/redis/go-redis/blob/v9.7.0/osscluster.go#L144

At this time the library we import for `url` parsing does not support Redis sentry. For this reason we also support passing the parameters individually as keys in the same `cacheDriver` map.
If and only if the `url` setting is missing, the other parameters are read from `cacheDriver`.
The keys are the same as the attributes that would otherwise be included in the `url`.

In the case of a Redis Sentinel setup, you would need to add each key manually in the `cacheDriver` map and make sure to specify
a `master_name` key, see https://github.com/redis/go-redis/blob/v9.7.0/universal.go#L240

#### Redis cluster configuration

The following storage configuration is for a Redis cluster:

```json
    "storage": {
        "rootDirectory": "/tmp/zot",
        "remoteCache": true,
        "cacheDriver": {
            "name": "redis",
            "url": "redis://user:password@host1:6379?addr=host2:6379&addr=host3:6379",
            "keyprefix": "zot"
        }
    }
```

#### Add Redis configuration parameters

The following storage configuration contains all Redis parameters:

```json
    "storage": {
        "rootDirectory": "/tmp/zot",
        "remoteCache": true,
        "cacheDriver": {
            "name": "redis",
            "keyprefix": "zot",
            "addr": ["host1:6379", "host2:6379", "host3:6379"],
            "client_name": "client",
            "db": 1,
            "protocol": 3,
            "username": "user1",
            "password": "pass1",
            "sentinel_username": "user2",
            "sentinel_password": "pass2",
            "max_retries": 3,
            "min_retry_backoff": "5s",
            "max_retry_backoff": "5s",
            "dial_timeout": "5s",
            "read_timeout": "5s",
            "write_timeout": "5s",
            "context_timeout_enabled": false,
            "pool_fifo": false,
            "pool_size": 3,
            "pool_timeout": "5s",
            "min_idle_conns": 1,
            "max_idle_conns": 3,
            "max_active_conns": 3,
            "conn_max_idle_time": "5s",
            "conn_max_lifetime": "5s",
            "max_redirects": 3,
            "read_only": false,
            "route_by_latency": false,
            "route_randomly": false,
            "master_name": "zotmeta",
            "disable_identity": false,
            "identity_suffix": "zotmeta",
            "unstable_resp3": false
        },
    }
```

> :warning: setting all of the parameters above for the same use case does not make sense, as some parameters for single instance, cluster and sentry configurations exclude one another.

## Remote storage subpaths

As in the case with local filesystem storage, you can use multiple remote storage locations using the `subpath` attribute, as in the following example.

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
       .
       .
       .
    }
}
```

The `subPaths` feature ties together several separate storage filesystems and backends behind the same HTTP API interface. In the example above, both repository paths "/a" and "/b" are exposed to clients. Content on these two paths can be hosted completely separately by different storage services, locations, or filesystems, with no difference to the user interface and no perceptible difference to the user experience. This is useful if one wants to serve existing OCI images from different backends or if storage can be expanded only by using different backing stores.

> :bulb: zot also supports different storage drivers for each subpath.
