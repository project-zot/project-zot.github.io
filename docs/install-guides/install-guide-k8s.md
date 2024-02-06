# Installing zot with Kubernetes and Helm

> :point_right: Using Kubernetes with Helm charts for zot, you can easily deploy zot as an application in a Kubernetes cluster.

## Before you begin

### Prerequisites

-   kubectl must be installed and a Kubernetes cluster must be ready.

-   [Helm](https://helm.sh/) must be installed.

### Supported platforms

You can install zot on standard Linux platforms with Intel or ARM
processors and with systemd installed.

| OS    | ARCH  | Platform                            |
|-------|-------|-------------------------------------|
| linux | amd64 | Intel-based Linux servers           |
| linux | arm64 | ARM-based servers and Raspberry Pi4 |

Supported platforms and architectures

### About binary images

Refer to [*Released Images for zot*](../general/releases.md) for
information about available zot images along with information about
image variations, image locations, and image naming formats.

## Installing zot

### Step 1: Locate the Helm charts in a remote repository

1.  Specify a remote repository that contains the Helm charts for zot.
    Give the repo a local name, such as **project-zot**, as in this
    example:

    `helm repo add project-zot http://zotregistry.dev/helm-charts`

        "project-zot" has been added to your repositories

    > :pencil2:
    >
    >The Helm charts for zot are currently hosted in these publicly-accessible repositories:  
    > - zotregistry.dev  
    > - artifacthub.io
    >


2.  Search the repository to see the Helm charts for zot installation.
    Search using the keyword 'project-zot' or 'zot', as in this example:

    `helm search repo project-zot`

        NAME             CHART VERSION  APP VERSION  DESCRIPTION
        project-zot/zot  <chart-version>          {{ git.tag }}       A Helm chart for Kubernetes


    > :pencil2:
    >
    >The APP VERSION is the version/tag of the zot image used for the
    deployment.

3.  Update to the latest information of available charts from the chart
    repository, as shown in this example:

    `helm repo update project-zot`

        Hang tight while we grab the latest from your chart repositories...
        ...Successfully got an update from the "project-zot" chart repository
        Update Complete. ⎈Happy Helming!⎈

4.  Display the default information of the Helm chart, as shown in this
    example:

`helm show all project-zot/zot`

``` yaml
    apiVersion: v2
    appVersion: {{ git.tag }}
    description: A Helm chart for Kubernetes
    name: zot
    type: application
    version: <chart-version>

    # Default values for zot.
    # This is a YAML-formatted file.
    # Declare variables to be passed into your templates.
    replicaCount: 1
    image:
      repository: ghcr.io/project-zot/zot-linux-amd64
      pullPolicy: IfNotPresent
      tag: "{{ git.tag }}"
    serviceAccount:
      create: true
      annotations: {}
      name: ""
    service:
      type: NodePort
      port: 5000
```

### Step 2: Determine any needed changes from the Helm chart’s defaults

Inspect the default information of the Helm chart, as shown in the
previous step. In many cases, the default chart values may be
acceptable. If your installation requires any non-default settings, you
may be able to specify them during the installation. Not all chart
values are configurable, but you can display those that are configurable
using the command in the following example:

`helm show values project-zot/zot`

``` yaml
  # Default values for zot.
  # This is a YAML-formatted file.
  # Declare variables to be passed into your templates.
  replicaCount: 1
  image:
    repository: ghcr.io/project-zot/zot-linux-amd64
    pullPolicy: IfNotPresent
    tag: "{{ git.tag }}"
  serviceAccount:
    create: true
    annotations: {}
    name: ""
  service:
    type: NodePort
    port: 5000
```

The configurable settings in the chart are listed in the following
table:

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 75%" />
</colgroup>
<thead>
<tr class="header">
<th style="text-align: left;">parameter</th>
<th style="text-align: left;">description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="text-align: left;"><p>replicaCount</p></td>
<td style="text-align: left;"><p>Desired number of replicas of the
application</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p>image.repository</p></td>
<td style="text-align: left;"><p>Repository and image name for the
application</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p>image.pullPolicy</p></td>
<td style="text-align: left;"><p>Whether to pull the image from the
repository. If not specified, the policy depends on
<code>image.tag</code>:</p>
<ul>
<li><p>If tag is <code>:latest</code> or no tag:
<code>Always</code></p></li>
<li><p>If tag is other than <code>:latest</code>:
<code>IfNotPresent</code></p></li>
</ul></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p>image.tag</p></td>
<td style="text-align: left;"><p>Identifies different versions the
image. default is the chart <code>appVersion</code>.</p>
<p>Examples: <code>:latest</code> (the default) or
<code>:{{ git.tag }}</code></p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p>serviceAccount.create</p></td>
<td style="text-align: left;"><p>Specifies whether a service account
should be created</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p>serviceAccount.annotations</p></td>
<td style="text-align: left;"><p>Annotations to add to the service
account</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p>serviceAccount.name</p></td>
<td style="text-align: left;"><p>Name of the service account to use. If
<code>name</code> is not set and <code>create</code> is true, a name is
generated using the fullname template.</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p>service.type</p></td>
<td style="text-align: left;"><p>ClusterIP (default), NodePort,
LoadBalancer, ExternalName, or Headless</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p>service.port</p></td>
<td style="text-align: left;"><p>Port number for calling the
service</p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p>strategy.type</p></td>
<td style="text-align: left;"><p>Kubernetes deployment strategy type. [More Info](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy) </p></td>
</tr>
</tbody>
</table>

#### Customizing the Helm chart using 'set'

To override the default values in the chart, you can pass your custom
values by adding the `--set` flag in the `helm install` command.

For example, if your servers use an ARM processor instead of Intel, you
must change the `image.repository` name from **zot-linux-amd64** to
**zot-linux-arm64**:

`--set image.repository=ghcr.io/project-zot/zot-linux-arm64`

You can change multiple settings with one `--set` statement. For
example, you might want your installation to have more replicas or a
different port number:

`--set replicaCount=2,service.port=5050`

#### Customizing the Helm chart using a file

You can also create a YAML file with your overrides and then add the new
file by adding the `-f` flag to the `helm install` command. For example,
to override the replica count and port number, the contents of your YAML
file (for example, "myfile.yaml") would be:

``` yaml
replicaCount: 2
service:
  port: 5050
```

and the following flag would be added to the `helm install` command:

`-f myfile.yaml`

#### Additional information

See the [Helm documentation](https://helm.sh/docs/) for further
information about modifying the Helm chart.

### Step 3: Install zot

Install zot using the `helm install` command. The first example shows
how to perform a default installation. The additional examples show
different ways to modify the `helm install` command to override default
settings in the Helm chart:

**Example 1: use default chart parameters**

`helm install zot project-zot/zot`

    NAME: zot
    LAST DEPLOYED: Thu Aug 11 19:13:02 2022
    NAMESPACE: default
    STATUS: deployed
    REVISION: 1
    NOTES:
     Get the application URL by running these commands:
     export NODE_PORT=$(kubectl get --namespace default -o jsonpath="{.spec.ports[0].nodePort}" services zot)
     export NODE_IP=$(kubectl get nodes --namespace default -o jsonpath="{.items[0].status.addresses[0].address}")
     echo http://$NODE_IP:$NODE_PORT


**Example 2: modify specific chart parameters with 'set'**

`helm install --set replicaCount=2,service.port=5050 zot project-zot/zot`


**Example 3: modify specific chart parameters with a file**


`helm install -f myfile.yaml zot project-zot/zot`


**Example 4: use a specific version of the Helm chart**

`helm install zot project-zot/zot --version 0.1.0`


**Example 5: link to a kubeconfig file**

`helm install zot project-zot/zot --kubeconfig $HOME/.kube/config`

## After the installation

### Verify the installation

1.  List all releases that are either deployed or failed.

    `helm list`

        NAME  NAMESPACE  REVISION  UPDATED    STATUS    CHART      APP VERSION
        zot   default    1         <datetime> deployed  <chart-version>  {{ git.tag }}

    This response indicates that zot is deployed.

2.  After making sure that your pods are up and running, execute the
    following commands:

        $ export NODE_PORT=$(kubectl get --namespace default -o jsonpath="{.spec.ports[0].nodePort}" services zot)
        $ export NODE_IP=$(kubectl get nodes --namespace default -o jsonpath="{.items[0].status.addresses[0].address}")
        $ echo http://$NODE_IP:$NODE_PORT
        $ curl http://$NODE_IP:$NODE_PORT/v2/_catalog

    The response should display the current contents of your zot
    repository, which should be empty immediately after installation:

        {"repositories":[]}

### Edit the zot configuration file

The zot configuration file is a JSON or YAML file that contains all
configuration settings for zot functions such as:

-   network

-   storage

-   authentication

-   authorization

-   logging

-   metrics

-   synchronization with other registries

-   clustering

The Helm chart installs a minimal JSON configuration file as shown
below:

``` json
{
    "storage":
    {
        "rootDirectory": "/var/lib/registry"
    },
    "http":
    {
        "address": "0.0.0.0",
        "port": "5000"
    },
    "log":
    {
        "level": "debug"
    }
}
```

The zot configuration file is located at `/etc/zot/config.json`.

Refer to [*Configuring zot*](../admin-guide/admin-configuration.md) for complete information on configuring the zot server with the zot configuration file.

### Uninstalling zot

Should you need to uninstall zot, use the `helm uninstall` command, as
in this example:

`helm uninstall zot`
