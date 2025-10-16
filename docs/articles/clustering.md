# zot Clustering

> :point_right: High availability of the zot registry is supported by the following features:
>
> -   Stateless zot instances to simplify scale out
> -   Shared remote storage
> -   Bare-metal and Kubernetes deployments


To ensure high availability of the registry, zot supports a clustering
scheme with stateless zot instances/replicas fronted by a load balancer
and a shared remote backend storage. This scheme allows the registry
service to remain available even if a few replicas fail or become
unavailable. Load balancing across many zot replicas can also increase
aggregate network throughput.

![504569](../assets/images/504569.jpg){width="500"}

> :pencil2: Beginning with zot release v2.1.0, you can design a highly scalable cluster that does not require configuring the load balancer to direct repository queries to specific zot instances within the cluster. See [Scale-out clustering](scaleout.md). Scale-out clustering is the preferred method if you are running v2.1.0 or later.

Clustering is supported in both bare-metal and Kubernetes environments.
> :pencil2:
> The remote backend storage must be [S3 API-compatible](https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html).


## Bare-metal deployment

### Prerequisites

-   A highly-available load balancer such as HAProxy configured to direct traffic to zot replicas

-   Multiple zot replicas as `systemd` services hosted on multiple hosts or VMs

-   AWS S3 API-compatible remote backend storage

## Kubernetes deployment

### Prerequisites

-   A zot Kubernetes
    [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
    with required number of replicas

-   AWS S3 API-compatible remote backend storage.

-   A zot Kubernetes
    [Service](https://kubernetes.io/docs/concepts/services-networking/service/)

-   A zot Kubernetes [Ingress
    Gateway](https://kubernetes.io/docs/concepts/services-networking/ingress/)
    if the service needs to be exposed outside

## Implementing stateless zot

zot maintains two types of durable state:

-   the actual image data itself

-   the image metadata in the registry’s cache

In a stateless clustering scheme, the image data is stored in the remote
storage backend and the registry cache is disabled by turning off
deduplication.

## Ecosystem tools

The [OCI Distribution
Specification](https://github.com/opencontainers/distribution-spec)
imposes certain rules about the HTTP URI paths to which various
ecosystem tools must conform. Consider these rules when setting the HTTP
prefixes during load balancing and ingress gateway configuration.

## Examples

Clustering is supported by using multiple stateless zot replicas with shared S3 storage and an HAProxy (with sticky session) load balancing traffic to the replicas. Each replica is responsible for one or more repositories. If zli and the zot UI are used to interact with zot, the proxy is also required to deliver a cookie to the requestor to maintain a sticky session connection to the assigned instance.

> :point_right: For zot releases v2.1.9 and newer, zot can be optionally configured to save session information to an external Redis-compatible storage which can be shared by all zot instances. If this configuration is enabled, the proxy need not configure a sticky cookie. Note that this configuration is suitable for use when all the zot instances share a common data storage such as S3 and a common remote metadata store such as DynamoDB or Redis.

### HAProxy configuration

<details>
  <summary markdown="span">Click here to view a sample HAProxy configuration with a sticky session cookie.</summary>

```yaml

global
        log /dev/log    local0
        log /dev/log    local1 notice
        chroot /var/lib/haproxy
        maxconn 2000
        stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
        stats timeout 30s
        user haproxy
        group haproxy
        daemon

        # Default SSL material locations
        ca-base /etc/ssl/certs
        crt-base /etc/ssl/private

        # See: https://ssl-config.mozilla.org/#server=haproxy&server-version=2.0.3&config=intermediate
        ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
        ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
        ssl-default-bind-options ssl-min-ver TLSv1.2 no-tls-tickets

defaults
        log     global
        mode    http
        option  httplog
        option  dontlognull
        timeout connect 5000
        timeout client  50000
        timeout server  50000
        errorfile 400 /etc/haproxy/errors/400.http
        errorfile 403 /etc/haproxy/errors/403.http
        errorfile 408 /etc/haproxy/errors/408.http
        errorfile 500 /etc/haproxy/errors/500.http
        errorfile 502 /etc/haproxy/errors/502.http
        errorfile 503 /etc/haproxy/errors/503.http
        errorfile 504 /etc/haproxy/errors/504.http

frontend zot
    bind *:8080
    mode http
    use_backend zot-instance1 if { path_beg /v2/repo1/ }
    use_backend zot-instance2 if { path_beg /v2/repo2/ }
    use_backend zot-instance3 if { path_beg /v2/repo3/ }
    default_backend zot-cluster

backend zot-cluster
    mode http
    balance roundrobin
    cookie SERVER insert indirect nocache
    server zot-server1 127.0.0.1:9000 check cookie zot-server1
    server zot-server2 127.0.0.2:9000 check cookie zot-server2
    server zot-server3 127.0.0.3:9000 check cookie zot-server3

backend zot-instance1
    server zot-server1 127.0.0.1:9000 check maxconn 30

backend zot-instance2
    server zot-server2 127.0.0.2:9000 check maxconn 30

backend zot-instance3
    server zot-server3 127.0.0.3:9000 check maxconn 30
```

</details>

<details>
  <summary markdown="span">Click here to view a sample HAProxy configuration without a sticky session cookie (only zot v2.1.9 and newer if remote session storage is enabled)</summary>

```yaml

global
        log /dev/log    local0
        log /dev/log    local1 notice
        chroot /var/lib/haproxy
        maxconn 2000
        stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
        stats timeout 30s
        user haproxy
        group haproxy
        daemon

        # Default SSL material locations
        ca-base /etc/ssl/certs
        crt-base /etc/ssl/private

        # See: https://ssl-config.mozilla.org/#server=haproxy&server-version=2.0.3&config=intermediate
        ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
        ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
        ssl-default-bind-options ssl-min-ver TLSv1.2 no-tls-tickets

defaults
        log     global
        mode    http
        option  httplog
        option  dontlognull
        timeout connect 5000
        timeout client  50000
        timeout server  50000
        errorfile 400 /etc/haproxy/errors/400.http
        errorfile 403 /etc/haproxy/errors/403.http
        errorfile 408 /etc/haproxy/errors/408.http
        errorfile 500 /etc/haproxy/errors/500.http
        errorfile 502 /etc/haproxy/errors/502.http
        errorfile 503 /etc/haproxy/errors/503.http
        errorfile 504 /etc/haproxy/errors/504.http

frontend zot
    bind *:8080
    mode http
    use_backend zot-instance1 if { path_beg /v2/repo1/ }
    use_backend zot-instance2 if { path_beg /v2/repo2/ }
    use_backend zot-instance3 if { path_beg /v2/repo3/ }
    default_backend zot-cluster

backend zot-cluster
    mode http
    balance roundrobin
    server zot-server1 127.0.0.1:9000 check
    server zot-server2 127.0.0.2:9000 check
    server zot-server3 127.0.0.3:9000 check

backend zot-instance1
    server zot-server1 127.0.0.1:9000 check maxconn 30

backend zot-instance2
    server zot-server2 127.0.0.2:9000 check maxconn 30

backend zot-instance3
    server zot-server3 127.0.0.3:9000 check maxconn 30
```

</details>

### zot S3 configuration with DynamoDB

<details>
  <summary markdown="span">Click here to view a sample zot configuration for S3 and DynamoDB.</summary>

```json

{
    "distSpecVersion": "1.0.1-dev",
    "storage": {
        "rootDirectory": "/tmp/zot",
        "dedupe": false,
        "remoteCache": true,
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
        }
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

### zot S3 configuration with Redis

Multiple zot instances can share the same S3 `storageDriver` and Redis `cacheDriver` configurations.
The Redis server, DB, and `keyprefix` must match for all zot instances.

While the Redis `cacheDriver` implementation does support local storage, zot clustering with Redis is only supported for S3.

<details>
  <summary markdown="span">Click here to view a sample zot configuration for S3 and Redis.</summary>

```json

{
    "distSpecVersion": "1.0.1-dev",
    "storage": {
        "rootDirectory": "/tmp/zot",
        "dedupe": false,
        "remoteCache": true,
        "storageDriver": {
            "name": "s3",
            "rootdirectory": "/zot",
            "region": "us-east-2",
            "bucket": "zot-storage",
            "secure": true,
            "skipverify": false
        },
        "cacheDriver": {
            "name": "redis",
            "url": "redis://host:6379",
            "keyprefix": "zot"
        }
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

### zot S3 configuration with Redis for both metadata and session storage

Along with the same S3 `storageDriver` and Redis `cacheDriver`, from zot release v2.1.9 and newer, the Redis `sessionDriver` configuration can also be shared among zot instances.

The Redis server, DB, and `keyprefix` must match for all zot instances.

> :pencil2:
> It is recommended to use the shared `sessionDriver` configuration together with a common remote `cacheDriver` and `storageDriver`.

<details>
  <summary markdown="span">Click here to view a sample zot configuration for S3, Redis for metadata, and Redis for sessions storage</summary>

```json

{
    "distSpecVersion": "1.0.1-dev",
    "storage": {
        "rootDirectory": "/tmp/zot",
        "dedupe": false,
        "remoteCache": true,
        "storageDriver": {
            "name": "s3",
            "rootdirectory": "/zot",
            "region": "us-east-2",
            "bucket": "zot-storage",
            "secure": true,
            "skipverify": false
        },
        "cacheDriver": {
            "name": "redis",
            "url": "redis://host:6379",
            "keyprefix": "zot"
        }
    },
    "http": {
        "address": "127.0.0.1",
        "port": "8080",
        "auth": {
            "htpasswd": {
                "path": "path/to/htpasswd"
            },
            "sessionDriver": {
                "name": "redis",
                "url": "redis://host:6379",
                "keyprefix": "zotsession"
            }
        }
    },
    "log": {
        "level": "debug"
    }
}

```
</details>
