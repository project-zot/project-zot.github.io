# Glossary

## Documentation Icons

|Icon     | Description      |
|---------|------------------|
| :pencil2: | Note &mdash; A point of emphasis or caution. |
| :bulb: | Tip &mdash; A helpful suggestion or a reference to additional material not covered in this document. |
| :warning: | Warning &mdash; A suggestion or advisory intended to avoid a loss of service or data. | 

## Definitions


|Term     | Description      |
|---------|------------------|
| artifact | A file of any kind produced during a container build process or associated with the operation of a container. For example, a Helm chart is an artifact that might be stored along with a container. |
| CNCF | As part of the [Linux Foundation](https://www.linuxfoundation.org/), the [Cloud Native Computing Foundation](https://cncf.io/) provides support, oversight, and direction for open-source, cloud native projects. |
| cosign | [`cosign`](https://github.com/sigstore/cosign) is a tool that performs container signing, verification, and storage in an OCI registry. |
| cosigned | [`cosigned`](https://artifacthub.io/packages/helm/sigstore/cosigned#deploy-cosigned-helm-chart) is an image admission controller that validates container images before deploying them. |
| cri-o | [`cri-o`](https://github.com/cri-o/cri-o) is an implementation of the [Kubernetes Container Runtime Interface (CRI)](https://kubernetes.io/docs/concepts/architecture/cri/) to enable using OCI compatible runtimes. It is a lightweight alternative to using Docker as the runtime for Kubernetes. |
| deduplication | A storage space saving feature wherein only a single copy of specific content is maintained on disk while many different image manifests may hold references to that same content. |
| digest | A hashed checksum, such as SHA-256, for verifying the integrity of the downloaded image. |
| Distribution Specification | The [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec/) project defines an API protocol to facilitate and standardize the distribution of content. |
| extensions | Additional registry features (APIs) that are not a part of the Distribution Specification can be added as [Extensions](https://github.com/opencontainers/distribution-spec/tree/main/extensions).  |
| helm chart | A [helm chart](https://helm.sh/docs/topics/registries/) is a package of files that orchestrate the deployment of Kubernetes resources into a Kubernetes cluster. |
| manifest | An image manifest provides a configuration and set of layers for a single container image for a specific architecture and operating system. |
| node exporter | A software component that collects hardware and operating system level metrics exposed by the kernel. |
| OCI | The [Open Container Initiative (OCI)](https://opencontainers.org/) is an open governance structure for the express purpose of creating open industry standards around container formats and runtimes. |
| ORAS | [OCI Registry as Storage (ORAS)](https://oras.land/) is a tool for distributing OCI artifacts across OCI registries. |
| prometheus | [Prometheus](https://prometheus.io/docs/guides/node-exporter/) is a node exporter that exposes a wide variety of hardware- and kernel-related metrics. |
| registry | A service that stores and distributes container images and artifacts. |
| repository | A collection of images with the same name, differentiated by tags. |
| skopeo | [`skopeo`](https://github.com/containers/skopeo) is a command line utility that performs various operations on container images and image repositories. |
| stacker | [`stacker`](https://github.com/project-stacker/stacker) is a standalone tool for building OCI images via a declarative `yaml` format. The output of the build process is a container image in an OCI layout. |
| tag | A label applied to an image that distinguishes the image from other images in the same repository. A common example is a version tag. |
| referrer | A image containing a non-nil subject field with a descriptor to the referred imaged. |
| zb | A benchmarking tool, available as a zot companion binary, for benchmarking a zot registry or any other container image registry that conforms to the [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec). |
| zli | A zot companion binary that implements a set of command line commands for interacting with the zot registry server. |
| zui | A zot companion binary that implements a graphical user interface (GUI) for interacting with the zot registry server. |
| zxp | A node exporter, available as a zot companion binary,  that can be deployed with a minimal zot image in order to scrape metrics from the zot server. |
