# Building an OCI-native Container Image CI/CD Pipeline

Revised: 2022-09-30


> An **OCI-native** secure container image build/delivery pipeline using the following tools:
> 
> -   [`stacker`](https://github.com/project-stacker/stacker) for building OCI images
> 
> -   [`zot`](https://github.com/project-zot/zot) as a vendor-neutral OCI image registry server
> 
> -   [`skopeo`](https://github.com/containers/skopeo) for performing repository interactions
> 
> -   [`cosign`](https://github.com/sigstore/cosign) for container signing and verification
> 
> -   [`cri-o`](https://github.com/cri-o/cri-o) for deploying container images
> 
> -   [`cosigned`](https://artifacthub.io/packages/helm/sigstore/cosigned#deploy-cosigned-helm-chart) for validating container images before deployment




The [Open Container Initiative (OCI)](https://opencontainers.org/) is an open governance structure for the express purpose of creating open industry standards around container formats and runtimes.

This document describes a step-by-step procedure towards achieving an OCI-native secure software supply chain using [`zot`](https://github.com/project-zot/zot) in collaboration with other opensource tools. The following diagram shows a portion of the CI/CD pipeline.

![504568](../assets/images/504568.jpg){width="400"}

## Build images

[`stacker`](https://github.com/project-stacker/stacker) is a standalone tool for building OCI images via a declarative `yaml` format. The output of the build process is a container image in an OCI layout.



**example: stacker build command**

    stacker build -f <stackerfile.yaml>

## Image registry

[`zot`](https://github.com/project-zot/zot) is a production-ready vendor-neutral OCI image registry server purely based on the [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec). If `stacker` is used to build the OCI image, it can also be used to publish the built image to an OCI registry.


**example: stacker publish command**

    stacker publish --url <url> --username <user> --password <password>

Alternatively, you can use [`skopeo`](https://github.com/containers/skopeo), a command line utility that performs various operations on container images and image repositories.


**example: skopeo copies an image to a registry**

    skopeo copy --format=oci oci:<oci-dir>/image:tag \
      docker://<zot-server>/image:tag

## Signing images

[`cosign`](https://github.com/sigstore/cosign) is a tool that performs container signing, verification, and storage in an OCI registry.


**example: cosign generates keys and signs an image in the registry**

    cosign generate-key-pair

    cosign sign --key cosign.key <zot-server>/image:tag

## Deploying container images

[`cri-o`](https://github.com/cri-o/cri-o) is an implementation of the [Kubernetes Container Runtime Interface (CRI)](https://kubernetes.io/docs/concepts/architecture/cri/) to enable using OCI compatible runtimes. It is a lightweight alternative to using Docker as the runtime for Kubernetes.


**example: kubelet configuration file**

    apiVersion: v1
    kind: Pod
    metadata:
      name: example-pod
    spec:
      containers:
      - name: example-container
        image: <zot-server>/image:tag

## Container image verification

[`cosigned`](https://artifacthub.io/packages/helm/sigstore/cosigned#deploy-cosigned-helm-chart) is an image admission controller that validates container images before deploying them.


**example: install cosigned using Helm**

    kubectl create namespace cosign-system

    kubectl create secret generic mysecret -n \
      cosign-system --from-file=cosign.pub=./cosign.pub

    helm repo add sigstore https://sigstore.github.io/helm-charts

    helm repo update

    helm install cosigned -n cosign-system sigstore/cosigned \
      --devel --set cosign.secretKeyRef.name=mysecret
