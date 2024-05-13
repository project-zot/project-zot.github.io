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

> :pencil2: Beginning with zot release v2.1.0, you can design a highly scalable cluster that does not require configuring the load balancer to direct repository queries to specific zot instances within the cluster. See [Easy scaling of a zot cluster](scaleout.md). This is the preferred method if you are running v2.1.0 or later.

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
storage backend and the registry cache is disabled by turning off both
deduplication and garbage collection.

## Ecosystem tools

The [OCI Distribution
Specification](https://github.com/opencontainers/distribution-spec)
imposes certain rules about the HTTP URI paths to which various
ecosystem tools must conform. Consider these rules when setting the HTTP
prefixes during load balancing and ingress gateway configuration.

## Examples

Clustering is supported by using multiple stateless zot replicas with shared S3 storage and an HAProxy (with sticky session) load balancing traffic to the replicas.

### HAProxy YAML configuration

<details>
  <summary markdown="span">Click here to view a sample HAProxy configuration.</summary>

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
    default_backend zot-cluster

backend zot-cluster
    mode http
    balance roundrobin
    cookie SERVER insert indirect nocache
    server zot0 127.0.0.1:9000 check cookie zot0
    server zot1 127.0.0.2:9000 check cookie zot1
    server zot2 127.0.0.3:9000 check cookie zot2

```

</details>

### zot S3 configuration

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
