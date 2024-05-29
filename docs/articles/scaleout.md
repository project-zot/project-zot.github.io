# Scale-out clustering

> :point_right: A cluster of zot instances can be easily scaled with no repo-specific intelligence in the load balancing scheme, using:
>
> -   Stateless zot instances to simplify scale out
> -   Shared remote storage
> -   zot release v2.1.0 or later

Beginning with zot release v2.1.0, a new "scale-out" architecture greatly reduces the configuration required when deploying large numbers of zot instances. As before, multiple identical zot instances run simultaneously using the same shared reliable storage, but with improved scale and performance in large deployments. A highly scalable cluster can be architected by automatically sharding based on repository name so that each zot instance is responsible for a subset of repositories.

In a cloud deployment, the shared backend storage (such as AWS S3) and metadata storage (such as DynamoDB) can also be easily scaled along with the zot instances.

> :pencil2: For high availability clustering with earlier zot releases, see [zot Clustering](clustering.md).

## Prerequisites

For easy scaling of instances (replicas), the following conditions must be met:

- All zot replicas must be running zot release v2.1.0 (or later) with identical configurations.
- All zot replicas in the cluster use remote storage at a single shared S3 backend. There is no local caching in the zot replicas.
- Each zot replica in the cluster has its own IP address, but all replicas use the same port number.


## How it works

Each repo is served by one zot replica, and that replica is solely responsible for serving all images of that repo. A repo in storage can be written to only by the zot replica responsible for that repo.

When a zot replica in the cluster receives an image push or pull request for a repo, the receiving replica hashes the repo path and consults a hash table to determine which replica is responsible for the repo. 

- If the hash indicates that another replica is responsible, the receiving replica forwards the request to the responsible replica and then acts as a proxy, returning the response to the requestor. 
- If the hash indicates that the current (receiving) replica is responsible, the request is handled locally.


> :pencil2: For better resistance to collisions and preimage attacks, zot uses SipHash as the hashing algorithm.

Either of the following two schemes can be used to reach the cluster.

### Using a single entry point load balancer

![504569](../assets/images/504569.jpg){width="500"}

When a single entry point load balancer such as [HAProxy](https://www.haproxy.com/) is deployed, the number of zot replicas can easily be expanded by simply adding the IP addresses of the new replicas in the load balancer configuration. 

When the load balancer receives an image push or pull request for a repo, it forwards the request to any replica in the cluster.  No repo-specific programming of the load balancer is needed because the load balancer does not need to know which replica owns which repo. The replicas themselves can determine this.  

### Using DNS-based load balancing

Because the scale-out architecture greatly simplifies the role of the load balancer, it may be possible to eliminate the load balancer entirely. A scheme such as [DNS-based routing](https://coredns.io/plugins/loadbalance/) can be implemented, exposing the zot replicas directly to the clients.

## Configuration examples

In these examples, clustering is supported by using multiple stateless zot replicas with shared S3 storage and an HAProxy (with sticky session) load balancer forwarding traffic to the replicas.

### Cluster member configuration

In the replica configuration, each replica must have a list of its peers configured in the "members" section of the JSON structure. This is a list of reachable addresses or hostnames.  Each replica owns one of these addresses.

The replica must also have a hash key for hashing the repo path of the image request and a TLS certificate for authenticating with its peers.

<details>
  <summary markdown="span">Click here to view a sample cluster configuration for each replica. See the "cluster" section in the JSON structure.</summary>

```json
{
  "distSpecVersion": "1.1.0",
  "storage": {
    "rootDirectory": "/tmp/zot",
    "dedupe": false,
    "remoteCache": true,
    "storageDriver": {
      "name": "s3",
      "rootdirectory": "/zot",
      "region": "us-east-1",
      "regionendpoint": "localhost:4566",
      "bucket": "zot-storage",
      "secure": false,
      "skipverify": false
    },
    "cacheDriver": {
      "name": "dynamodb",
      "endpoint": "http://localhost:4566",
      "region": "us-east-1",
      "cacheTablename": "ZotBlobTable",
      "repoMetaTablename": "ZotRepoMetadataTable",
      "imageMetaTablename": "ZotImageMetaTable",
      "repoBlobsInfoTablename": "ZotRepoBlobsInfoTable",
      "userDataTablename": "ZotUserDataTable",
      "versionTablename": "ZotVersion",
      "apiKeyTablename": "ZotApiKeyTable"
    }
  },
  "http": {
    "address": "0.0.0.0",
    "port": "9000",
    "tls": {
      "cert": "test/data/server.cert",
      "key": "test/data/server.key"
    }
  },
  "log": {
    "level": "debug"
  },
  "cluster": {
    "members": [
      "zot-server1:9000",
      "zot-server2:9000",
      "zot-server3:9000"
    ],
    "hashKey": "loremipsumdolors",
    "tls": {
      "cacert": "test/data/ca.crt"
    }  
  }
}
```

</details>

### HAProxy configuration

The HAProxy load balancer uses a simple round-robin balancing scheme and delivers a cookie to the requestor to maintain a sticky session connection to the assigned replica.

<details>
  <summary markdown="span">Click here to view a sample HAProxy configuration.</summary>

```yaml

global
        log /dev/log    local0
        log /dev/log    local1 notice
        chroot /var/lib/haproxy
        maxconn 2000
        stats timeout 30s

defaults
        log     global
        mode    tcp
        option  tcplog
        option  dontlognull
        timeout connect 5000
        timeout client  50000
        timeout server  50000

frontend zot
    bind *:8080
    default_backend zot-cluster

backend zot-cluster
    mode http
    balance roundrobin
    cookie SERVER insert indirect nocache
    server zot-server1 127.0.0.1:9000 check cookie zot-server1
    server zot-server2 127.0.0.2:9000 check cookie zot-server2
    server zot-server3 127.0.0.3:9000 check cookie zot-server3

```

</details>

## When a replica fails

The scale-out clustering scheme described in this article is not self-healing when a replica fails. In case of a replica failure, only those repositories that are mapped to the failed replica are affected. If the error is not transient, the cluster must be resized and restarted to exclude that replica.

> :bulb: With an HAProxy load balancer, we recommend implementing an [HAProxy circuit breaker](https://www.haproxy.com/blog/circuit-breaking-haproxy) to monitor and protect the cluster.

## CVE repository in a zot cluster environment

CVE scanning is not supported for cloud deployments. In the scale-out clustering scheme described in this article, CVE scanning is disabled. In this case, we recommend implementing a CVE repository with a zot instance outside of the cluster using a local disk for storage and [Trivy](https://trivy.dev/) as the detection engine.

## Registry sync

The [sync](../articles/mirroring.md) feature of zot, either on demand or periodic, is compatible with scale-out clustering. In this case, the repo names are hashed to a particular replica and only that replica will perform the sync.