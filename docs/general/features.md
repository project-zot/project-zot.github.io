# Summary of Key Features

* Conforms to [OCI distribution spec](https://github.com/opencontainers/distribution-spec) APIs
* Uses [OCI image layout](https://github.com/opencontainers/image-spec/blob/master/image-layout.md) for image storage
  * Can serve any OCI image layout as a registry 
* Single binary for **all** the features
* Doesn't require _root_ privileges
* Clear separation between core dist-spec and zot-specific extensions
* Supports container image signatures - [cosign](https://github.com/sigstore/cosign) and [notation](https://github.com/notaryproject/notation)
* Supports [helm charts](https://helm.sh/docs/topics/registries/)
* Behavior controlled via [configuration](https://github.com/project-zot/zot/blob/main/examples/README.md)
* Binaries released for multiple os/arch
* Supports advanced image queries using _search_ extension
* Supports image deletion by tag
* Currently suitable for on-prem deployments (e.g. colocated with Kubernetes)
* Compatible with ecosystem tools such as [skopeo](#skopeo) and [cri-o](#cri-o)
* [Vulnerability scanning of images](#Scanning-images-for-known-vulnerabilities)
* TLS support
* Authentication via:
  * TLS mutual authentication
  * HTTP *Basic* (local _htpasswd_ and LDAP)
  * HTTP *Bearer* token
* Supports Identity-Based Access Control
* Supports live modifications on the config file while zot is running (Authorization config only)
* Inline storage optimizations:
  * Automatic garbage collection of orphaned blobs
  * Layer deduplication using hard links when content is identical
  * Data scrubbing
* Serve [multiple storage paths (and backends)](https://github.com/project-zot/zot/blob/main/examples/config-multiple.json) using a single zot server
* Pull and synchronize from other dist-spec conformant registries [sync](#sync)
* Supports ratelimiting including per HTTP method
* [Metrics](#metrics) with Prometheus
  * Using a node exporter in case of minimal zot
* Swagger based documentation
* [zli](https://github.com/project-zot/zot/tree/main/cmd/zli): [command-line client support](#cli)
* Also, [zb](https://github.com/project-zot/zot/tree/main/cmd/zb): [a benchmarking tool](#benchmarking) for dist-spec conformant registries
* Released under  [Apache 2.0 License](https://github.com/project-zot/zot/blob/main/LICENSE)
