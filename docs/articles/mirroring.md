# OCI Registry Mirroring With zot

> :point_right: A `zot` registry can mirror one or more upstream OCI registries, including popular cloud registries such as Docker Hub and Google Container Registry (gcr.io).

A key use case for zot is to act as a mirror for upstream registries. If an upstream registry is OCI distribution-spec conformant for pulling images, you can use zot's `sync` feature to implement a downstream mirror, synchronizing OCI images and corresponding artifacts. Because synchronized images are stored in zot's local storage, registry mirroring allows for a fully distributed disconnected container image build pipeline. Container image operations terminate in local zot storage, which may reduce network latency and costs.

> :warning: Because zot is a OCI-only registry, any upstream image stored in the Docker image format is converted to OCI format when downloading to zot. In the conversion, some non-OCI attributes may be lost and the image digest will change. Pulling with <tag>@<digest> will not work as expected. Signatures, for example, are removed due to the mismatch between the old and the new digests.

> :pencil2: If Docker compatibility is enabled using the `compat` attribute under `http` in the zot configuration, Docker image format conversion to OCI image format can be disabled using the `preserveDigest` setting.

## Mirroring modes

For mirroring an upstream registry, two common use cases are a fully mirrored or a pull through (on-demand) cache registry.

As with git, wherein every clone is a full repository, you can configure your local zot instance to be a fully mirrored OCI registry. For this mode, configure zot for synchronization by periodic polling, not on-demand. Zot copies and caches a full copy of every image on the upstream registry, updating the cache whenever polling discovers a change in content or image version at the upstream registry.

For a pull through cache mirrored registry, configure zot for on-demand synchronization. When an image is first requested from the local zot registry, the image is downloaded from the upstream registry and cached in local storage. Subsequent requests for the same image are served from zot's cache. Images that have not been requested are not downloaded. If a polling interval is also configured, zot periodically polls the upstream registry for changes, updating any cached images if changes are detected.

> :pencil2:
> Because Docker Hub rate-limits pulls and does not support catalog listing, do not use polled mirroring with Docker Hub. Use only on-demand mirroring with Docker Hub.

## Migrating or updating a registry using mirroring

Mirroring zot using the `sync` feature allows you to easily migrate a registry. In situations such as the following, zot mirroring provides an easy solution.

- Migrating an existing zot or non-zot registry to a new location.

    Provided that the source registry is OCI-compliant for image pulls, you can mirror the registry to a new zot registry, delete the old registry, and reroute network traffic to the new registry.

- Updating (or downgrading) a zot registry.

    To minimize downtime during an update, or to avoid any incompatibilities between zot releases that would preclude an in-place update, you can bring up a new zot registry with the desired release and then migrate from the existing registry.

To ensure a complete migration of the registry contents, set a polling interval in the configuration of the new zot registry and set `prefix` to `**`, as shown in this example:

```json
  {
  	"urls": [
  		"https://registry1:5000"
  	],
  	"pollInterval": "12h",
  	"onDemand": true,
  	"content": [
  		{
  			"prefix": "**"
  		}
  	]
  }
```

## Basic configuration for mirroring with sync

The `sync` feature of zot is an [extension](https://github.com/opencontainers/distribution-spec/tree/main/extensions) of the OCI-compliant registry implementation. You can configure the `sync` feature under the `extensions` section of the zot configuration file, as shown in this example:

```json
  "extensions": {
    "sync": {
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
          "maxRetries": 3,
          "retryDelay": "5m",
          "onlySigned": true,
          "preserveDigest": true,
          "content": [
            {
              "prefix": "/repo2/repo",
              "tags": {
                "regex": "4.*",
                "semver": true
              }
              "destination": "/repo2",
              "stripPrefix": true
            }
          ]
        }
      ]
    }
  }
```

The following table lists the configurable attributes for the `sync` feature:

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
<tr class="even">
<td style="text-align: left;"><p><strong>credentialsFile</strong></p></td>
<td style="text-align: left;"><p>The location of a local file containing credentials for other registries, as in the following example: <pre>{<br/>&emsp;&emsp;"127.0.0.1:8080": {<br/>&emsp;&emsp;&emsp;&emsp;"username": "user",<br/>&emsp;&emsp;&emsp;&emsp;"password": "pass"<br/>&emsp;&emsp;},<br/>&emsp;&emsp;&emsp;&emsp;"registry2:5000": {<br/>&emsp;&emsp;&emsp;&emsp;"username": "user2",<br/>&emsp;&emsp;&emsp;&emsp;"password": "pass2"<br/>&emsp;&emsp;}<br/>}</pre></p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><strong>urls</strong></p></td>
<td style="text-align: left;"><p>A list of one or more URLs to an upstream image registry. If the main URL fails, the sync process will try the next URLs in the listed order.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><strong>onDemand</strong></p></td>
<td style="text-align: left;"><ul>
<li><p><code>true</code>: When an image is requested by the user, pull it from the upstream registries and serve it to the user.</p></li>
<li><p><code>false</code>: When an image is requested by the user, serve it only if already synced in the local registry.</p></li>
</ul></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><strong>pollInterval</strong></p></td>
<td style="text-align: left;"><p>The period in seconds between polling of a remote registry. If no value is specified, no periodic polling will occur. If a value is set and the <strong>content</strong> attributes are configured, periodic synchronization is enabled and will run at the specified value.<br/><br/><strong>Note:</strong> Because Docker Hub rate-limits pulls and does not support catalog listing, do not use polled mirroring with Docker Hub. Use only onDemand mirroring with Docker Hub.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><strong>tlsVerify</strong></p></td>
<td style="text-align: left;"><ul>
<li><p><code>false</code>: TLS will not be verified.</p></li>
<li><p><code>true</code>: (Default) The TLS connection to the destination registry will be verified.</p></li>
</ul></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><strong>certDir</strong></p></td>
<td style="text-align: left;"><p>If a path is specified, use
certificates (*.crt, *.cert, *.key files) at this path when connecting to the destination registry or daemon. If no path is specified, use the default certificates directory.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><strong>maxRetries</strong></p></td>
<td style="text-align: left;"><p>The maximum number of retries if an
error occurs during either an on-demand or periodic synchronization. If no value is specified, no retries will occur.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><strong>retryDelay</strong></p></td>
<td style="text-align: left;"><p>The interval in seconds between retries. This attribute is mandatory when maxRetries is configured.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><strong>syncTimeout</strong></p></td>
<td style="text-align: left;"><p>The timeout duration for on-demand sync operations. This timeout applies to the entire image sync operation, including downloading the manifest and all associated blobs (layers, config, referrers, etc.). If the requesting client disconnects, the sync operation will continue in the background until this timeout is reached. If not specified or set to zero, the default timeout of 3 hours is used. This prevents sync operations from being cancelled when HTTP clients disconnect (e.g., Kubernetes timeout/retries).</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><strong>onlySigned</strong></p></td>
<td style="text-align: left;"><ul>
<li><p><code>false</code>: Synchronize signed or unsigned images.</p></li>
<li><p><code>true</code>: Synchronize only signed images (either notary or cosign).</p></li>
</ul></td>
<tr class="odd">
<td style="text-align: left;"><p><strong>preserveDigest</strong></p></td>
<td style="text-align: left;"><ul>
<li><p><code>false</code>: Convert remote compatible media types to OCI media types locally.</p></li>
<li><p><code>true</code>: Keep remote media types as they are.</p></li>
<div class="note">
<p><strong>Note:</strong> For Docker media types support, set this setting to <code>false</code> to keep signatures and other referrers in working condition</p>
</div></li>
</ul></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><strong>content</strong></p></td>
<td style="text-align: left;"><p>The included attributes in this section specify which content will be pulled. If this section is not populated, periodic polling will not occur. The included attributes can also filter which on-demand images are pulled.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p>&emsp;&emsp;<strong>prefix</strong></p></td>
<td style="text-align: left;"><p>On the remote registry, the path from which images will be pulled. This path can be a string that exactly matches the remote path, or it can be a <a href="https://en.wikipedia.org/wiki/Glob_(programming)">glob</a> pattern. For example, the path can include a wildcard (<strong>*</strong>) or a recursive wildcard (<strong>**</strong>).</p></td>
</tr>

<tr class="odd">
<td style="text-align: left;"><p>&emsp;&emsp;<strong>tags</strong></p></td>
<td style="text-align: left;"><p>The included attributes in this optional section specify how remote images will be selected for synchronization based on image tags.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p>&emsp;&emsp;<strong>tags.regex</strong></p></td>
<td style="text-align: left;"><p>Specifies a regular expression for matching image tags. Images whose tags do not match the expression are not pulled.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p>&emsp;&emsp;<strong>tags.semver</strong></p></td>
<td style="text-align: left;"><p>Specifies whether image tags are to be filtered by semantic versioning (<a href="https://semver.org/">semver</a>) compliance.</p>
<ul>
<li><p><code>false</code>: Do not filter by semantic versioning.</p></li>
<li><p><code>true</code>: Filter by semantic versioning.</p></li>
</ul></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p>&emsp;&emsp;<strong>destination</strong></p></td>
<td style="text-align: left;"><p>Specifies the local path in which pulled images are to be stored.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p>&emsp;&emsp;<strong>stripPrefix</strong></p></td>
<td style="text-align: left;"><p>Specifies whether the prefix path from the remote registry will be retained or replaced when the image is stored in the zot registry.</p>
<ul>
<li><p><code>false</code>: Retain the source prefix, append it to the destination path.</p></li>
<li><p><code>true</code>: Remove the source prefix.</p>
<div class="note">
<p><strong>Note:</strong> If the source prefix was specified with meta-characters (such as <strong>**</strong>), only the prefix segments that precede the meta-characters are removed. Any remaining path segments are appended to the destination path.</p>
</div></li>
</ul></td>
</tr>
</tbody>
</table>

## Configuring mirroring modes

Two mirroring modes were described in this document:
- periodic - the registry syncs images matching specific patters from the upstream registries at a given polling interval
- on demand - the registry reaches out to the upstream registries when the image is requested by the user

These two modes can be configured, separately or together, using specific settings. See the table below for details:

| `onDemand` | `pollInterval` | `content` | Result |
| ---------- | -------------- | --------- | ------ |
| false      | omitted        | omitted            | sync is disabled |
| false      |  >0            | omitted            | sync is disabled |
| false      | omitted        | at least 1 entry   | sync is disabled |
| false      |  >0            | at least 1 entry   | sync is enabled in periodic mode for the images matching the content patterns |
| true       | omitted        | omitted            | sync is enabled in on demand mode for any image |
| true       |  >0            | omitted            | sync is enabled in on demand mode for any image |
| true       | omitted        | at least 1 entry   | sync is enabled in on demand mode for the images matching the content patterns |
| true       |  >0            | at least 1 entry   | sync is enabled in both periodic and on demand modes for the images matching the content patterns |

## Configuration examples for mirroring

### Example: Multiple repositories with polled mirroring

The following is an example of sync configuration for mirroring multiple repositories with polled mirroring.

```json
"sync": {
  "enable": true,
  "credentialsFile": "./examples/sync-auth-filepath.json",
  "registries": [
    {
      "urls": ["https://registry1:5000"],
      "onDemand": false,
      "pollInterval": "6h",
      "tlsVerify": true,
      "certDir": "/home/user/certs",
      "maxRetries": 3,
      "retryDelay": "5m",
      "onlySigned": true,
      "preserveDigest": true,
      "content": [
        {
          "prefix": "/repo1/repo",
          "tags": {
            "regex": "4.*",
            "semver": true,
            "tags": {
								"excludeRegex": ".*-(amd64|arm64)$"
						}
          }
        },
        {
          "prefix": "/repo2/repo",
          "destination": "/repo2",
          "stripPrefix": true
        },
        {
          "prefix": "/repo3/repo"
        }
      ]
    }
  }
```

The configuration in this example will result in the following behavior:

- Only signed images (notation and cosign) are synchronized.
- The sync communication is secured using certificates in `certDir`.
- This registry synchronizes with upstream registry every 6 hours.
- This registry preserves upstream digests instead of converting them to OCI images.
- On-demand mirroring is disabled.
- Based on the content filtering options, this registry synchronizes these images:
    - From /repo1/repo, images with tags that begin with "4." and are semver compliant but excluding some tag patterns <br/>Files are stored locally in /repo1/repo on localhost.
    - From /repo2/repo, images with all tags. <br/>Because `stripPrefix` is enabled, files are stored locally in /repo2. For example, docker://upstream/repo2/repo:v1 is stored as docker://local/repo2:v1.
    - From /repo3/repo, images with all tags. <br/>Files are stored locally in /repo3/repo.

### Example: Multiple registries with on-demand mirroring

The following is an example of sync configuration for mirroring multiple registries with on-demand mirroring.

```json
{
  "distSpecVersion": "1.0.1",
  "storage": {
    "rootDirectory": "/tmp/zot",
    "gc": true
  },
  "http": {
    "address": "0.0.0.0",
    "port": "8080"
  },
  "log": {
    "level": "debug"
  },
  "extensions": {
    "sync": {
      "enable": true,
      "registries": [
        {
          "urls": ["https://k8s.gcr.io"],
          "content": [
            {
              "prefix": "**",
              "destination": "/k8s-images"
            }
          ],
          "onDemand": true,
          "tlsVerify": true,
          "syncTimeout": "10m"
        },
        {
          "urls": ["https://docker.io/library"],
          "content": [
            {
              "prefix": "**",
              "destination": "/docker-images"
            }
          ],
          "onDemand": true,
          "tlsVerify": true
        }
      ]
    }
  }
}
```

With this zot configuration, the sync behavior is as follows:

1. This initial user request for content from the zot registry:<br/>
   `skopeo copy --src-tls-verify=false docker://localhost:8080/docker-images/alpine <dest>`<br/>causes zot to synchronize the content with the docker.io registry:<br/>&nbsp;&nbsp;&nbsp;&nbsp;`docker.io/library/alpine:latest`<br/>to the zot registry:<br>&nbsp;&nbsp;&nbsp;&nbsp;`localhost:8080/docker-images/alpine:latest`<br/>before delivering the content to the requestor at `<dest>`.

2. This initial user request for content from the zot registry:<br/>
  `skopeo copy --src-tls-verify=false docker://localhost:8080/k8s-images/kube-proxy:v1.19.2 <dest>`<br/>causes zot to synchronize the content with the gcr.io registry:<br/>&nbsp;&nbsp;&nbsp;&nbsp;`k8s.gcr.io/kube-proxy:v1.19.2` <br/>to the zot registry:<br/>&nbsp;&nbsp;&nbsp;&nbsp;`localhost:8080/k8s-images/kube-proxy:v1.19.2`<br/>before delivering the content to the requestor at `<dest>`.

You can use this command:<br/>&nbsp;&nbsp;&nbsp;&nbsp;
`curl http://localhost:8080/v2/_catalog`<br/>to display the local repositories:

```json
  {
    "repositories":[
      "docker-images/alpine",
      "k8s-images/kube-proxy"
    ]
  }
```

### Example: Multiple registries with mixed mirroring modes

The following is an example of a zot configuration file for mirroring multiple upstream registries.

```json
{
  "distSpecVersion": "1.1.0-dev",
  "storage": {
    "rootDirectory": "/tmp/zot"
  },
  "http": {
    "address": "127.0.0.1",
    "port": "8080"
  },
  "log": {
    "level": "debug"
  },
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
          "maxRetries": 3,
          "retryDelay": "5m",
          "onlySigned": true,
          "content": [
            {
              "prefix": "/repo1/repo",
              "tags": {
                "regex": "4.*",
                "semver": true
              }
            },
            {
              "prefix": "/repo1/repo",
              "destination": "/repo",
              "stripPrefix": true
            },
            {
              "prefix": "/repo2/repo"
            }
          ]
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
              "tags": {
                "semver": true
              }
            }
          ]
        },
        {
          "urls": [
            "https://docker.io/library"
          ],
          "onDemand": true,
          "tlsVerify": true,
          "maxRetries": 6,
          "retryDelay": "5m"
        }
      ]
    }
  }
}
```

[//]: # (https://github.com/project-zot/zot/blob/main/examples/config-sync.json)


### Example: Support for subpaths in local storage

```json
{
  "distSpecVersion": "1.0.1",
  "storage": {
    "subPaths":{
      "/kube-proxy":{
        "rootDirectory": "/tmp/kube-proxy",
        "dedupe": true,
        "gc": true
       }
     },
    "rootDirectory": "/tmp/zot",
    "gc": true
  },
  "http": {
    "address": "0.0.0.0",
    "port": "8080"
  },
  "log": {
    "level": "debug"
  },
  "extensions": {
    "sync": {
      "enable": true,
      "registries": [
        {
          "urls": ["https://k8s.gcr.io"],
          "content": [
            {
              "destination": "/kube-proxy",
              "prefix": "**"
            }
          ],
          "onDemand": true,
          "tlsVerify": true,
          "maxRetries": 2,
          "retryDelay": "5m"
        }
      ]
    }
  }
}
```
With this zot configuration, the sync behavior is as follows:

- This user request for content from the zot registry:<br/>
  `skopeo copy --src-tls-verify=false docker://localhost:8080/kube-proxy/kube-proxy:v1.19.2 <dest>`<br/>causes zot to synchronize the content with this remote registry:<br/>&nbsp;&nbsp;&nbsp;&nbsp;`k8s.gcr.io/kube-proxy:v1.19.2`<br/>to the zot registry:<br/>&nbsp;&nbsp;&nbsp;&nbsp;`localhost:8080/kube-proxy/kube-proxy:v1.19.2`<br/>before delivering the content to the requestor at `<dest>`.

You can use this command:<br/>&nbsp;&nbsp;&nbsp;&nbsp;
`curl http://localhost:8080/v2/_catalog`<br/>to display the local repositories:

```json
  {
    "repositories":[
      "docker-images/alpine",
      "k8s-images/kube-proxy",
      "kube-proxy/kube-proxy"
    ]
  }
```

In zot storage, the requested content is located here:<br/>&nbsp;&nbsp;&nbsp;&nbsp;`/tmp/zot/kube-proxy/kube-proxy/kube-proxy/`<br/>This subpath is created from the following path components:

- `/tmp/zot` is the `rootDirectory` of the zot registry
- `kube-proxy` is the `rootDirectory` of the storage subpath
- `kube-proxy` is the sync `destination` parameter
- `kube-proxy` is the repository name

### Example: Support for AWS ECR

This is an example configuration demonstrating how to use the sync extension with Amazon ECR (Elastic Container Registry) credential helper. The configuration enables zot to synchronize container images from an ECR registry.

```json
"extensions": {
        "sync": {
            "credentialsFile": "",
            "DownloadDir": "/tmp/zot",
            "registries": [
                {
                    "urls": [
                        "https://ACCOUNTID.dkr.ecr.REGION.amazonaws.com"
                    ],
                    "onDemand": true,
                    "maxRetries": 5,
                    "retryDelay": "2m",
                    "credentialHelper": "ecr"
                }
            ]
        }
    }
```