# Software Provenance Workflow Using OCI Artifacts

> :point_right: This article demonstrates an end-to-end workflow for installing a zot registry, then pushing and signing an image and a related artifact, such as an SBOM.

## Workflow

The following sections describe the step-by-step workflow. To view the steps combined into a single script, see [Reference: Full workflow script](#fullscript).

For the workflow examples, the zot registry is assumed to be installed and running at `localhost:8080`.

### Step 1: Download the client tools

This workflow uses the `regctl` registry client and the `cosign` image signing tool. As a first step, we download binaries for these tools in a tools directory. 

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
```


### Step 2: Deploy an OCI registry with referrers support (zot)

Next, we execute the following tasks to deploy an OCI registry:

- Copy a zot executable binary to the server.
- Create a basic configuration file for the zot server, specifying the local root directory, the network location, and the port number.
- Launch zot with the newly-created configuration file.
- Looping with a periodic cURL query, detect when zot is up and running.

```shell
{% raw %}
ZOT=${TOOLSDIR}/bin/zot
ZOT_VERSION=2.0.0-rc6
curl -Lo ${ZOT} https://github.com/project-zot/zot/releases/download/v${ZOT_VERSION}/zot-linux-amd64-minimal
chmod +x ${ZOT}

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

# call the function to start zot
zot_setup
{% endraw %}
```


### Step 3: Copy an image to the OCI registry

This step copies a busybox container image into the registry.

```shell
{% raw %}
skopeo copy --format=oci --dest-tls-verify=false docker://busybox:latest docker://${ZOT_HOST}:${ZOT_PORT}/busybox:latest
{% endraw %}
```


### Step 4: Copy a related artifact to the OCI registry

This step creates a simple artifact file and associates it with the busybox image in the registry.

```shell
{% raw %}
cat > ${TEST_TMPDIR}/artifact.yaml << EOF
key:
  val: artifact
EOF
${REGCLIENT} artifact put --artifact-type application/yaml -f ${TEST_TMPDIR}/artifact.yaml --subject ${ZOT_HOST}:${ZOT_PORT}/busybox:latest
{% endraw %}
```

The `--subject` command flag associates the artifact file with the specified subject (in this case, the busybox image). If no subject is specified by the command, the artifact is considered independent and not associated with any existing image.


### Step 5: Display the artifact tree

This step prints the artifact tree of the busybox image.  The tree includes the artifact yaml file, showing the association of the artifact to the busybox image.

These script commands define REF0 as the artifact that was uploaded referring to the first container image. 

```shell
{% raw %}
REF0=$(${REGCLIENT} artifact tree --format '{{jsonPretty .}}' localhost:8080/busybox:latest | jq .referrer[0].reference.Digest)
REF0="${REF0:1:-1}"
{% endraw %}
```

The following example shows the command and its output:

    $ regctl artifact tree localhost:8080/busybox:latest

    Ref: localhost:8080/busybox:latest  
    Digest: sha256:9172c5f692f2c65e4f773448503b21dba2de6454bd159905c4bf6d83176e4ea3
    Referrers:  
       - sha256:9c0655368b10ca4b2ffe39e4dd261fb89df25a46ae92d6eb4e6e1792a451883e: application/yaml

The displayed artifact tree shows that the original image (`localhost:8080/busybox:latest`) has one direct referrer (`sha256:9c06...883e: application/yaml`), the artifact yaml file.


### Step 6: Sign the image and artifact

This step creates a key pair for cosign in a separate directory, then uses cosign to sign both the image and the artifact file. Both signatures, like the artifact file itself, are associated with the busybox image. 

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

This step again prints the artifact tree, which should now show the artifact and the two signatures, all associated to the busybox image.

```shell
{% raw %}
${REGCLIENT} artifact tree localhost:8080/busybox:latest
{% endraw %}
```

The following example shows the command and its output:

    $ regctl artifact tree localhost:8080/busybox:latest

    Ref: localhost:8080/busybox:latest
    Digest: sha256:9172c5f692f2c65e4f773448503b21dba2de6454bd159905c4bf6d83176e4ea3
    Referrers:
      - sha256:9c0655368b10ca4b2ffe39e4dd261fb89df25a46ae92d6eb4e6e1792a451883e: application/yaml
        Referrers:
          - sha256:06792b209137486442a2b804b2225c0014e3e238d363cdbea088bbd73207fb34: application/vnd.dev.cosign.artifact.sig.v1+json
      - sha256:995b6a78bf04a7a9676dac76b4598ccb645c17e30b02f294de9fdfa2f28eb7b2: application/vnd.dev.cosign.artifact.sig.v1+json

The displayed artifact tree shows that the original image now has two direct referrers &mdash; the artifact and the cosign signature of the original image. In addition, there is a second-level referrer &mdash; the cosign signature of the artifact, which is a referrer of the artifact file.


### Step 8: End of demonstration

This step halts the zot registry server, ending the workflow demonstration.

```shell
{% raw %}
# function for stopping zot after demonstration
function zot_teardown() {
  killall zot
}

# stop zot
zot_teardown
{% endraw %}
```


<a name="fullscript"></a>

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
