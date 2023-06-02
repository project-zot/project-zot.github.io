# Using kind for Deployment Testing

> :point_right: Use [kind](https://kind.sigs.k8s.io/) to try out zot deployment with Kubernetes.

This article describes how to create a kind cluster that includes a local zot registry. 

## Deploying the cluster and registry

The procedure described installs a kind cluster with a zot registry at `localhost:5001` and then loads and runs a "hello" app to test the installation. Although the procedure is given as a series of steps, you can find [a complete shell script](#reference-a-complete-script) to perform these steps at the end of this article.

> :pencil2: This article is based on [Create A Cluster And Registry](https://kind.sigs.k8s.io/docs/user/local-registry/#create-a-cluster-and-registry), which you can find on the [kind website](https://kind.sigs.k8s.io/).


### Step 1: Prepare the environment 

The following packages must be installed:

- docker
- kubernetes
- kind
- containerd
- skopeo

Execute the following shell commands to set environment variables.

```shell
set -o errexit

# set no_proxy if applicable
if [ ! -z "${no_proxy}" ]; then 
  echo "Updating no_proxy environment variables";
  export no_proxy=${no_proxy},kind-registry;
  export NO_PROXY=${no_proxy};
fi
```

### Step 2: Create a registry container

Create a "kind-registry" container, pulling a zot binary from the GitHub Container Registry (ghcr.io).  

> :pencil2: This example pulls `zot-minimal-linux-amd64:latest`,   
> a minimal (no extensions) zot image for an AMD-based linux server. 
>       
> Other available images are described at the [zot releases page](https://github.com/project-zot/zot/releases) in GitHub.  
> You can also specify a release by replacing `latest` with an available release number.

```shell
{% raw %}
# create registry container unless it already exists
reg_name='kind-registry'
reg_port='5001'
if [ "$(docker inspect -f '{{.State.Running}}' "${reg_name}" 2>/dev/null || true)" != 'true' ]; then
  docker run \
    -d --restart=always -p "127.0.0.1:${reg_port}:5000" --name "${reg_name}" \
    ghcr.io/project-zot/zot-minimal-linux-amd64:latest
fi
{% endraw %}
```

### Step 3: Create the kind cluster

Create a cluster with the local registry enabled.

```shell
# enable the local registry in containerd
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:${reg_port}"]
    endpoint = ["http://${reg_name}:5000"]
EOF
```

### Step 4:  Connect the registry to the cluster network

Connect the registry to the "kind" network so that it can communicate with other resources in the same network.

```shell
{% raw %}
# check whether already connected to the network
if [ "$(docker inspect -f='{{json .NetworkSettings.Networks.kind}}' \
"${reg_name}")" = 'null' ]; then
  docker network connect "kind" "${reg_name}"
fi
{% endraw %}
```

### Step 5:  Document the local registry

Create a ConfigMap that specifies how to interact with the local registry. This ConfigMap follows the [KEP-1755 Standard for communicating a local registry](https://github.com/kubernetes/enhancements/tree/master/keps/sig-cluster-lifecycle/generic/1755-communicating-a-local-registry).

```shell
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "localhost:${reg_port}"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF
```

### Step 6:  Deploy and test

Use `skopeo` to copy (pull) a "hello" app from the Google Container Registry (gcr.io) into the new zot registry. Using `kubectl`, deploy the app from the new local zot registry as "hello-server" and monitor the deployment for initial availability.

```shell
# copy an image
skopeo copy --format=oci --dest-tls-verify=false docker://gcr.io/ \
google-samples/hello-app:1.0 docker://localhost:5001/hello-app:1.0

# deploy the image
kubectl create deployment hello-server --image=localhost:5001/hello-app:1.0

# check for availability
echo "Waiting for deployment/hello-server to be ready ..."
kubectl wait deployment -n default hello-server \
  --for condition=Available=True --timeout=90s
```

## Clean up

To clean up after testing, run the following commands to delete the cluster and registry.

```shell
kind delete cluster
docker stop kind-registry
docker rm kind-registry
```

<a name="complete-script"></a>

## Reference: A complete script

The following script executes all of the preceding steps.

<details>
  <summary markdown="span">Click here to view the entire script</summary>

```shell
{% raw %}
#!/bin/sh
set -o errexit

# Reference: https://kind.sigs.k8s.io/docs/user/local-registry/

# set no_proxy if applicable
if [ ! -z "${no_proxy}" ]; then 
  echo "Updating no_proxy env var";
  export no_proxy=${no_proxy},kind-registry;
  export NO_PROXY=${no_proxy};
fi

# create registry container unless it already exists
reg_name='kind-registry'
reg_port='5001'
if [ "$(docker inspect -f '{{.State.Running}}' "${reg_name}" 2>/dev/null || true)" != 'true' ]; then
  docker run \
    -d --restart=always -p "127.0.0.1:${reg_port}:5000" --name "${reg_name}" \
    ghcr.io/project-zot/zot-minimal-linux-amd64:latest
fi

# create a cluster with the local registry enabled in containerd
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:${reg_port}"]
    endpoint = ["http://${reg_name}:5000"]
EOF

# connect the registry to the cluster network if not already connected
if [ "$(docker inspect -f='{{json .NetworkSettings.Networks.kind}}' "${reg_name}")" = 'null' ]; then
  docker network connect "kind" "${reg_name}"
fi

# https://github.com/kubernetes/enhancements/tree/master/keps/sig-cluster-lifecycle/generic/1755-communicating-a-local-registry
#
# document the local registry
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "localhost:${reg_port}"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF

# copy an image
skopeo copy --format=oci --dest-tls-verify=false docker://gcr.io/google-samples/hello-app:1.0 docker://localhost:5001/hello-app:1.0

# deploy the image
kubectl create deployment hello-server --image=localhost:5001/hello-app:1.0

# check for availability
echo "Waiting for deployment/hello-server to be ready ..."
kubectl wait deployment -n default hello-server --for condition=Available=True --timeout=90s

# cleanup
echo "Press a key to begin cleanup ..."
read KEYPRESS
kind delete cluster
docker stop kind-registry
docker rm kind-registry
{% endraw %}
```

</details>