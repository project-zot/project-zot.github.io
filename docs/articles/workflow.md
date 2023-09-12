# Software Provenance Workflow Using OCI Artifact

> :point_right: This article demonstrates an end-to-end workflow for installing a zot registry, pushing and signing an image and artifact, and verifying the results.


## Workflow

### Step 1: Set up the environment and tools

As a first step, we define and create directories, then download binaries for zot, regctl, and cosign. 

```shell
TEST_TMPDIR=$(mktemp -d "${PWD}/artifact-test-${1:+-$1}.XXXXXX")

TOOLSDIR=$(pwd)/hack/tools
mkdir -p ${TOOLSDIR}/bin

REGCLIENT=${TOOLSDIR}/bin/regctl
REGCLIENT_VERSION=v0.5.1
curl -Lo ${REGCLIENT} https://github.com/regclient/regclient/releases/download/${REGCLIENT_VERSION}/regctl-linux-amd64
chmod +x ${REGCLIENT}

COSIGN=${TOOLSDIR}/bin/cosign
COSIGN_VERSION=2.1.1
curl -Lo ${COSIGN} https://github.com/sigstore/cosign/releases/download/v${COSIGN_VERSION}/cosign-linux-amd64 
chmod +x ${COSIGN}

# OCI registry
ZOT=${TOOLSDIR}/bin/zot
ZOT_VERSION=2.0.0-rc6
curl -Lo ${ZOT} https://github.com/project-zot/zot/releases/download/v${ZOT_VERSION}/zot-linux-amd64-minimal
chmod +x ${ZOT}
```


### Step 2: Launch zot

In this step, we do the following:

- Create a basic configuration file for the zot server, specifying the local root directory, the network location, and the port number.
- Launch zot with the newly-created configuration file.
- Looping with a periodic cURL query, detect when zot is up and running.

```shell
{% raw %}
ZOT_HOST=localhost
ZOT_PORT=8080

# function to start zot and test for readiness
function zot_setup() {
cat > $TEST_TMPDIR/zot-config.json << EOF
{
  "distSpecVersion": "1.1.0-dev",
  "storage": {
      "rootDirectory": "$TEST_TMPDIR/zot"
  },
  "http": {
      "address": "$ZOT_HOST",
      "port": "$ZOT_PORT"
  },
  "log": {
      "level": "error"
  }
}
EOF
  # start zot as a background task
  ${ZOT} serve $TEST_TMPDIR/zot-config.json &
  pid=$!
        # wait until service is up
  count=5
  up=0
  while [[ $count -gt 0 ]]; do
    if [ ! -d /proc/$pid ]; then
      echo "zot failed to start or died"
      exit 1
    fi
    up=1
    curl -f http://$ZOT_HOST:$ZOT_PORT/v2/ || up=0
    if [ $up -eq 1 ]; then break; fi
    sleep 1
    count=$((count - 1))
  done
  if [ $up -eq 0 ]; then
    echo "Timed out waiting for zot"
    exit 1
  fi
  # setup an OCI client
  ${REGCLIENT} registry set --tls=disabled $ZOT_HOST:$ZOT_PORT
}

# function for stopping zot after demonstration
function zot_teardown() {
  killall zot
}

# call the function to start zot
zot_setup
{% endraw %}
```


### Step 3: Copy an image to the zot registry

This step copies a busybox container image into the zot registry.

```shell
{% raw %}
skopeo copy --format=oci --dest-tls-verify=false docker://busybox:latest docker://${ZOT_HOST}:${ZOT_PORT}/busybox:latest
{% endraw %}
```


### Step 4: Copy an artifact to the zot registry

This step creates a simple artifact file and associates it with the busybox image in the zot registry.

```shell
{% raw %}
cat > ${TEST_TMPDIR}/artifact.yaml << EOF
key:
  val: artifact
EOF
${REGCLIENT} artifact put --artifact-type application/yaml -f ${TEST_TMPDIR}/artifact.yaml --subject ${ZOT_HOST}:${ZOT_PORT}/busybox:latest
{% endraw %}
```

> :pencil2: If no subject is specified in the command, the artifact is considered independent and not associated with any existing image.


### Step 5: Display the artifact tree

This step prints the artifact tree, including the yaml artifact. The tree shows the association of the artifact to the busybox image.

```shell
{% raw %}
REF0=$(${REGCLIENT} artifact tree --format '{{jsonPretty .}}' localhost:8080/busybox:latest | jq .referrer[0].reference.Digest)
REF0="${REF0:1:-1}"
{% endraw %}
```

!!! note "Mike's Questions"

    What is the purpose of creating and truncating REF0? 

    How is REF0 used in the cosign commands in Step 6?

    Should we show an example of the tree?

### Step 6: Sign the image and artifact

This step creates a key pair for cosign in a separate directory, then uses cosign to sign the image and artifact. Both signatures, like the artifact file itself, are associated with the busybox image. 

```shell
{% raw %}
# create a key pair in a different directory
pushd ${TEST_TMPDIR}
COSIGN_PASSWORD= ${COSIGN} generate-key-pair
popd
# sign the image
COSIGN_PASSWORD= COSIGN_OCI_EXPERIMENTAL=1 COSIGN_EXPERIMENTAL=1 ${COSIGN} sign -y --key ${TEST_TMPDIR}/cosign.key --registry-referrers-mode=oci-1-1 ${ZOT_HOST}:${ZOT_PORT}/busybox:latest
# sign the artifact referring to the image
COSIGN_PASSWORD= COSIGN_OCI_EXPERIMENTAL=1 COSIGN_EXPERIMENTAL=1 ${COSIGN} sign -y --key ${TEST_TMPDIR}/cosign.key --registry-referrers-mode=oci-1-1 ${ZOT_HOST}:${ZOT_PORT}/busybox@${REF0}
{% endraw %}
```


### Step 7: Display the artifact tree

This step again prints the artifact tree. The tree now shows the artifact and the two signatures, all associated to the busybox image.

```shell
{% raw %}
${REGCLIENT} artifact tree localhost:8080/busybox:latest
{% endraw %}
```


## Reference: Full workflow script

Expand the text box below to view the entire workflow as a single executable shell script.

> :bulb: To copy the script to the clipboard, click the copy icon that appears in the upper right corner of the expanded text box.


<details>
  <summary markdown="span">Click here to view the all-in-one script</summary>

```shell
{% raw %}
#!/bin/bash -xe

TEST_TMPDIR=$(mktemp -d "${PWD}/artifact-test-${1:+-$1}.XXXXXX")

TOOLSDIR=$(pwd)/hack/tools
mkdir -p ${TOOLSDIR}/bin

REGCLIENT=${TOOLSDIR}/bin/regctl
REGCLIENT_VERSION=v0.5.1
curl -Lo ${REGCLIENT} https://github.com/regclient/regclient/releases/download/${REGCLIENT_VERSION}/regctl-linux-amd64
chmod +x ${REGCLIENT}

COSIGN=${TOOLSDIR}/bin/cosign
COSIGN_VERSION=2.1.1
curl -Lo ${COSIGN} https://github.com/sigstore/cosign/releases/download/v${COSIGN_VERSION}/cosign-linux-amd64 
chmod +x ${COSIGN}

# OCI registry
ZOT=${TOOLSDIR}/bin/zot
ZOT_VERSION=2.0.0-rc6
curl -Lo ${ZOT} https://github.com/project-zot/zot/releases/download/v${ZOT_VERSION}/zot-linux-amd64-minimal
chmod +x ${ZOT}

ZOT_HOST=localhost
ZOT_PORT=8080

function zot_setup() {
cat > $TEST_TMPDIR/zot-config.json << EOF
{
  "distSpecVersion": "1.1.0-dev",
  "storage": {
      "rootDirectory": "$TEST_TMPDIR/zot"
  },
  "http": {
      "address": "$ZOT_HOST",
      "port": "$ZOT_PORT"
  },
  "log": {
      "level": "error"
  }
}
EOF
# start as a background task
${ZOT} serve $TEST_TMPDIR/zot-config.json &
pid=$!
        # wait until service is up
count=5
up=0
while [[ $count -gt 0 ]]; do
    if [ ! -d /proc/$pid ]; then
    echo "zot failed to start or died"
    exit 1
    fi
    up=1
    curl -f http://$ZOT_HOST:$ZOT_PORT/v2/ || up=0
    if [ $up -eq 1 ]; then break; fi
    sleep 1
    count=$((count - 1))
done
if [ $up -eq 0 ]; then
    echo "Timed out waiting for zot"
    exit 1
fi
# setup a OCI client
${REGCLIENT} registry set --tls=disabled $ZOT_HOST:$ZOT_PORT
}

# function for stopping zot after demonstration
function zot_teardown() {
killall zot
}

# call the function to start zot
zot_setup

# copy an image
skopeo copy --format=oci --dest-tls-verify=false docker://busybox:latest docker://${ZOT_HOST}:${ZOT_PORT}/busybox:latest

# copy an artifact referring to the above image
cat > ${TEST_TMPDIR}/artifact.yaml << EOF
key:
val: artifact
EOF
${REGCLIENT} artifact put --artifact-type application/yaml -f ${TEST_TMPDIR}/artifact.yaml --subject ${ZOT_HOST}:${ZOT_PORT}/busybox:latest
REF0=$(${REGCLIENT} artifact tree --format '{{jsonPretty .}}' localhost:8080/busybox:latest | jq .referrer[0].reference.Digest)
REF0="${REF0:1:-1}"

# create a key pair in a different directory
pushd ${TEST_TMPDIR}
COSIGN_PASSWORD= ${COSIGN} generate-key-pair
popd
# sign the image
COSIGN_PASSWORD= COSIGN_OCI_EXPERIMENTAL=1 COSIGN_EXPERIMENTAL=1 ${COSIGN} sign -y --key ${TEST_TMPDIR}/cosign.key --registry-referrers-mode=oci-1-1 ${ZOT_HOST}:${ZOT_PORT}/busybox:latest
# sign the artifact referring to the image
COSIGN_PASSWORD= COSIGN_OCI_EXPERIMENTAL=1 COSIGN_EXPERIMENTAL=1 ${COSIGN} sign -y --key ${TEST_TMPDIR}/cosign.key --registry-referrers-mode=oci-1-1 ${ZOT_HOST}:${ZOT_PORT}/busybox@${REF0}

# list the reference tree
${REGCLIENT} artifact tree localhost:8080/busybox:latest

# stop zot
zot_teardown
{% endraw %}
```

</details>
