
# zot Clustering

Revised: 2022-10-17

> High availability of the `zot` registry is supported by the following features:
>
> -   Stateless `zot` instances to simplify scale out
> -   Bare-metal and Kubernetes deployments


To ensure high-availability of the registry,`zot` supports a clustering
scheme with stateless `zot` instances/replicas fronted by a loadbalancer
and a shared remote backend storage. This scheme allows the registry
service to remain available even if a few replicas fail or become
unavailable. Loadbalancing across many zot replicas can also increase
aggregate network throughput.

![504569](../assets/images/504569.jpg)

Clustering is supported in both bare-metal and Kubernetes environments.
> **Note:**
> The remote backend storage must be [S3 API-compatible](https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html).


## Bare-metal deployment

### Prerequisites

-   A highly-available loadbalancer such as `HAProxy` configured to direct traffic to `zot` replicas.

-   Multiple `zot` replicas as `systemd` services hosted on mutiple hosts or VMs.

-   AWS S3 API-compatible remote backend storage.

## Kubernetes deployment

### Prerequisites

-   A `zot` Kubernetes
    [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
    with required number of replicas.

-   AWS S3 API-compatible remote backend storage.

-   A `zot` Kubernetes
    [Service](https://kubernetes.io/docs/concepts/services-networking/service/).

-   A `zot` Kubernetes [Ingress
    Gateway](https://kubernetes.io/docs/concepts/services-networking/ingress/)
    if the service needs to be exposed outside.

## Implementing stateless zot

`zot` maintains two types of durable state:

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
prefixes during loadbalancing and ingress gateway configuration.
