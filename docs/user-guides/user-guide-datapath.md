# Push and Pull Image Content

Revised: 2022-09-29

A zot registry can store and serve a variety of content, but the type of
content may dictate your choice of a client tool.

For various content types, this document shows examples of using a
third-party client tool that supports the content. The following table
shows which content and client tools are demonstrated.

| Content type  | Client                                 |
|---------------|----------------------------------------|
| OCI images    | [skopeo](#using-skopeo)                |
| OCI images    | [regclient](#using-regedit) (`regctl`) |
| OCI artifacts | [ORAS](#using-oras)                    |
| Helm charts   | [helm](#using-helm)                    |

> **Note:**
> In the following examples, the zot registry is located at myZotRegistry.com, using port number 5000.

<a name="using-skopeo"></a>

## Common tasks using skopeo for OCI images

[`skopeo`](https://github.com/containers/skopeo) is a command line
client that performs various operations on OCI container images and
image repositories.

> **Note:**
> For detailed information about using skopeo, see the [skopeo man page](https://github.com/containers/skopeo/blob/main/docs/skopeo.1.md).


### Push an OCI image

This example pushes the latest container image for the `busybox`
application to a zot registry.

    $ skopeo --insecure-policy copy --dest-tls-verify=false --multi-arch=all \
       --format=oci docker://busybox:latest \
       docker://myZotRegistry.com:5000/busybox:latest

### Pull an OCI image

This example pulls the latest container image for the `busybox`
application and stores the image to a local OCI-layout directory
(`/oci/images`).

    $ skopeo --insecure-policy copy --src-tls-verify=false --multi-arch=all \
       docker://myZotRegistry.com:5000/busybox:latest \
       oci:/oci/images:busybox:latest

### Pull an OCI image to a private docker registry

This example pulls the latest container image for the `busybox`
application and stores the image to a local private docker registry.

    $ skopeo --insecure-policy copy --src-tls-verify=false --multi-arch=all \
       docker://myZotRegistry.com:5000/busybox:latest \
       docker://localhost:5000/busybox:latest

### Authentication

In these examples, authentication is disabled for the source and
destination. You can enable authentication by changing the command line
options as follows:

    --src-tls-verify=true
    --dest-tls-verify=true

You can also add credentials for authenticating with a source or
destination repository:

    --src-creds username:password
    --dest-creds username:password

<a name="using-regclient"></a>

## Common tasks using regclient for OCI images

[regclient](https://github.com/regclient/regclient) is a client
interface that performs various operations on OCI container images and
image repositories. The command line interface for regclient is
`regctl.`

> **Note:**
> For detailed information about `regctl` commands, see the [regctl Documentation](https://github.com/regclient/regclient/blob/main/docs/regctl.md).

### Push an OCI image

This example pushes version 1.18 of `golang` to a `tools` repository
within the registry.

    $ regctl registry set --tls=disabled myZotRegistry.com:5000
    $ regctl image copy ocidir://path/to/golang:1.18 myZotRegistry.com:5000/tools

### Pull an OCI image

This example pulls version 1.18 of `golang` to a local OCI-layout
directory.

    $ regctl image copy myZotRegistry.com:5000/tools ocidir://path/to/golang:1.18

### List all repositories in registry

This example list all repositories in the registry.

    $ regctl repo ls myZotRegistry.com:5000

### List tags

This example lists all tags in the `tools` repository within the
registry.

    $ regctl tag ls myZotRegistry.com:5000/tools

### Pull and push manifest

This example pulls and pushes the manifest in the `tools` repository
within the registry.

    $ regctl manifest get myZotRegistry.com:5000/tools --format=raw-body
    $ regctl manifest put myZotRegistry.com:5000/tools:1.0.0 \
    --format oci --content-type application/vnd.oci.image.manifest.v1+json \
    --format oci

### Authentication

In the preceding examples, TLS authentication with the zot registry was
disabled by the following command:

    $ regctl registry set --tls=disabled myZotRegistry.com:5000

This command allows `regctl` to accept an HTTP response from the zot
server. If TLS authentication is enabled on the zot registry server, you
can omit this command from your `regctl` session.

<a name="using-oras"></a>

## Common tasks using oras for OCI artifacts

[ORAS](https://oras.land/cli/) (OCI Registry As Storage) is a command
line client for storing OCI artifacts on OCI repositories.

> **Note:**
> For detailed information about the `oras` commands in these examples,
see the [ORAS CLI documentation](https://oras.land/cli/).


### Push an artifact

This example pushes version 2 of an artifact file named `hello-artifact`
to a zot registry.

    $ oras push --plain-http myZotRegistry.com:5000/hello-artifact:v2 \
            --config config.json:application/vnd.acme.rocket.config.v1+json \
            artifact.txt:text/plain -d -v

### Pull an artifact

This example pulls version 2 of an artifact file named `hello-artifact`
from a zot registry.

    $ oras pull --plain-http myZotRegistry.com:5000/hello-artifact:v2 -d -v

### Authentication

To authenticate with the zot server, log in at the start of your session
using the following command:

    $ oras login -u myUsername -p myPassword myZotRegistry.com:5000

You can also add credentials in the push or pull commands as in this
example:

    $ oras pull -u myUsername -p myPassword \
    myZotRegistry.com:5000/hello-artifact:v2 -d -v

> **Note:**
> For additional authentication options, including interactive credential entry and disabling TLS, see the [ORAS login documentation](https://github.com/oras-project/oras/blob/main/cmd/oras/login.go).

<a name="using-helm"></a>

## Common tasks using helm for helm charts

[Helm](https://helm.sh/) is a package manager for Kubernetes. Among many
other capabilities, helm can store and retrieve helm charts on OCI image
repositories.

> **Note:**
> For detailed information about the `helm` commands in these examples, see [Commands for working with registries](https://helm.sh/docs/topics/registries/) in the helm documentation.

### Push a helm chart

This example pushes version 1.2.3 of a zot helm chart to a `zot-chart`
repository within the registry.

    $ helm package path/to/helm-charts/charts/zot
    $ helm push zot-1.2.3.tgz oci://myZotRegistry.com:5000/zot-chart

### Pull a helm chart

This example pulls version 1.2.3 of a zot helm chart from a `zot-chart`
repository within the registry.

    $ helm pull oci://myZotRegistry.com:5000/zot-chart/zot --version 1.2.3

### Authentication

To authenticate with the zot server, log in at the start of your session
using the following command:

    $ helm registry login -u myUsername myZotRegistry.com:5000

You will be prompted to manually enter a password.
