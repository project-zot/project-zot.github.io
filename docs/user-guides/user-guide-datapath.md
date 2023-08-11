# Push and Pull Image Content

> :point_right: **zot** is an OCI image registry that allows you to store, manage, and share container images.

A zot registry can store and serve a variety of content, but the type of
content may dictate your choice of a client tool.

For various content types, this document shows examples of using a
third-party client tool that supports the content. The following table
shows which content and client tools are demonstrated.

| Content Type  | Client                                 |
|---------------|----------------------------------------|
| OCI images    | [skopeo](#using-skopeo)                |
| OCI images    | [regclient](#using-regclient) (`regctl`) |
| OCI images    | [crane](#using-crane)                  |
| OCI artifacts | [oras](#using-oras)                    |
| Helm charts   | [helm](#using-helm)                    |

> :pencil2: zot is compatible with kubernetes/cri-o using `docker://` transport, which is the default.

> :pencil2:
> In the following examples, the zot registry is located at `localhost`, using port number 5000.

<a name="using-skopeo"></a>

## Common tasks using skopeo for OCI images

[`skopeo`](https://github.com/containers/skopeo) is a command line
client that performs various operations on OCI container images and
image repositories.

> :pencil2:
> For detailed information about using skopeo, see the [skopeo man page](https://github.com/containers/skopeo/blob/main/docs/skopeo.1.md).


### Push an OCI image

This example pushes the latest container image for the `busybox`
application to a zot registry.

    $ skopeo --insecure-policy copy --dest-tls-verify=false --multi-arch=all \
       --format=oci docker://busybox:latest \
       docker://localhost:5000/busybox:latest

### Pull an OCI image

This example pulls the latest container image for the `busybox`
application and stores the image to a local OCI-layout directory
(`/oci/images`).

    $ skopeo --insecure-policy copy --src-tls-verify=false --multi-arch=all \
       docker://localhost:5000/busybox:latest \
       oci:/oci/images:busybox:latest

### Pull an OCI image to a private docker registry

This example pulls the latest container image for the `busybox`
application and stores the image to a local private docker registry.

    $ skopeo --insecure-policy copy --src-tls-verify=false --multi-arch=all \
       docker://localhost:5000/busybox:latest \
       docker://localhost:5000/busybox:latest

<details>
  <summary markdown="span">Click here to view an example of pushing and pulling an image using skopeo.</summary>

<p align="center">
  <img width="600" src="https://raw.githubusercontent.com/project-zot/zot/8fb11180d473d7bb137b6d09d9ebf48065363e5f/demos/skopeo-push-pull.svg"></img>
</p>
</details>

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

> :pencil2:
> For detailed information about `regctl` commands, see the [regctl Documentation](https://github.com/regclient/regclient/blob/main/docs/regctl.md).

### Push an OCI image

This example pushes version 1.18 of `golang` to a `tools` repository
within the registry.

    $ regctl registry set --tls=disabled localhost:5000
    $ regctl image copy ocidir://path/to/golang:1.18 localhost:5000/tools

### Pull an OCI image

This example pulls version 1.18 of `golang` to a local OCI-layout
directory.

    $ regctl image copy localhost:5000/tools ocidir://path/to/golang:1.18

### List all repositories in registry

This example list all repositories in the registry.

    $ regctl repo ls localhost:5000

### List tags

This example lists all tags in the `tools` repository within the
registry.

    $ regctl tag ls localhost:5000/tools

### Pull and push manifest

This example pulls and pushes the manifest in the `tools` repository
within the registry.

    $ regctl manifest get localhost:5000/tools --format=raw-body
    $ regctl manifest put localhost:5000/tools:1.0.0 \
    --format oci --content-type application/vnd.oci.image.manifest.v1+json \
    --format oci

### Authentication

In the preceding examples, TLS authentication with the zot registry was
disabled by the following command:

    $ regctl registry set --tls=disabled localhost:5000

This command allows `regctl` to accept an HTTP response from the zot
server. If TLS authentication is enabled on the zot registry server, you
can omit this command from your `regctl` session.

<a name="using-oras"></a>

## Common tasks using oras for OCI artifacts

[ORAS](https://oras.land) (OCI Registry As Storage) is a command
line client for storing OCI artifacts on OCI repositories.

> :pencil2:
> For detailed information about the `oras` commands in these examples,
see the [ORAS CLI documentation](https://oras.land/docs/commands/use_oras_cli).


### Push an artifact

This example pushes version 2 of an artifact file named `hello-artifact`
to a zot registry.

    $ oras push --plain-http localhost:5000/hello-artifact:v2 \
            --config config.json:application/vnd.acme.rocket.config.v1+json \
            artifact.txt:text/plain -d -v

### Pull an artifact

This example pulls version 2 of an artifact file named `hello-artifact`
from a zot registry.

    $ oras pull --plain-http localhost:5000/hello-artifact:v2 -d -v

<details>
  <summary markdown="span">Click here to view an example of pushing and pulling an artifact using oras.</summary>
<p align="center">
  <img width="600" src="https://raw.githubusercontent.com/project-zot/zot/8fb11180d473d7bb137b6d09d9ebf48065363e5f/demos/oras-push-pull.svg"></img>
</p>
</details>

### Attach a reference

    $ echo '{"artifact": "localhost:5000/hello-artifact:v2", "signature": "pat hancock"}' > signature.json

    $ oras push localhost:5000/hello-artifact \
      --artifact-type 'signature/example' \
      --subject localhost:5000/hello-artifact:v2 \
      ./signature.json:application/json

    $ oras discover -o tree localhost:5000/hello-artifact:v2


### Authentication

To authenticate with the zot server, log in at the start of your session
using the following command:

    $ oras login -u myUsername -p myPassword localhost:5000

You can also add credentials in the push or pull commands as in this
example:

    $ oras pull -u myUsername -p myPassword localhost:5000/hello-artifact:v2 -d -v

> :pencil2:
> For additional authentication options, including interactive credential entry and disabling TLS, see the [ORAS authentication documentation](https://oras.land/docs/how_to_guides/authentication).

<a name="using-helm"></a>

## Common tasks using helm for helm charts

[Helm](https://helm.sh/) is a package manager for Kubernetes. Among many
other capabilities, helm can store and retrieve helm charts on OCI image
repositories.

> :pencil2:
> For detailed information about the `helm` commands in these examples, see [Commands for working with registries](https://helm.sh/docs/topics/registries/) in the helm documentation.

### Push a helm chart

This example pushes version 1.2.3 of a zot helm chart to a `zot-chart`
repository within the registry.

    $ helm package path/to/helm-charts/charts/zot
    $ helm push zot-1.2.3.tgz oci://localhost:5000/zot-chart

### Pull a helm chart

This example pulls version 1.2.3 of a zot helm chart from a `zot-chart`
repository within the registry.

    $ helm pull oci://localhost:5000/zot-chart/zot --version 1.2.3

### Authentication

To authenticate with the zot server, log in at the start of your session
using the following command:

    $ helm registry login -u myUsername localhost:5000

You will be prompted to manually enter a password.

<a name="using-crane"></a>

## Common tasks using crane for OCI images

[crane](https://github.com/google/go-containerregistry/blob/main/cmd/crane/README.md) is an open-source project that provides a command-line interface (CLI) for interacting with container registries, such as Docker Hub and Google Container Registry.

> :pencil2:
> For detailed information about `crane` commands, see the [crane Documentation](https://github.com/google/go-containerregistry/tree/main/cmd/crane/doc/crane.md).

### Push an OCI image

This example pushes the latest container image for the `alpine`
application to a  registry.

    $ crane --insecure push \
       oci/images/alpine:latest \
       localhost:5000/alpine:latest

### Pull an OCI image

This example pulls the latest container image for the `alpine`
application and stores the image to a local OCI-layout directory
(`/oci/images`).

    $ crane --insecure pull \
       --format oci \
       localhost:5000/alpine:latest \
       oci/images/alpine:latest

### Copy an OCI image to a private docker registry

This example pulls the latest container image for the `alpine`
application and stores the image to a local private docker registry.

    $ crane --insecure copy \
       alpine:latest \
       localhost:5000/alpine:latest

### List tags

This example lists all tags in the `alpine` image within the
registry.

    $ crane ls localhost:5000/alpine

### Find the digest of an image

This example gets the digest of the `alpine` image within the
registry.

    $ crane digest localhost:5000/alpine:latest

### Authentication

To authenticate with the registry server, log in at the start of your session
using the following command:

    $ crane auth login -u myUsername localhost:5000
