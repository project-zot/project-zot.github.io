# Verifying image signatures

Images stored in zot can be signed with a digital signature to verify the source and integrity of the image. The digital signature can be verified by zot using public keys or certificates uploaded by the user.

To verify image signatures, zot supports the following tools:

- [cosign](https://docs.sigstore.dev/cosign/overview/)
- [notation](https://github.com/notaryproject/notation)

### Cosign v3 Sigstore bundles

zot recognizes the Sigstore bundle format emitted by cosign v3, with artifact media type `application/vnd.dev.sigstore.bundle.v0.3+json`. These signatures are discovered through the OCI referrers API and are included in zot's signature verification and search metadata alongside legacy cosign signatures.

Cosign v3 bundles are verified against uploaded cosign public keys in the same way as other key-based cosign signatures. No additional zot configuration is required beyond enabling cosign verification and uploading the corresponding public key.

### Signatures, attestations, and metadata storage

Cosign attestations are OCI referrers, not image signatures. An attestation by itself does not cause zot to report an image as signed.

Beginning with zot v2.1.22, signature verification reads signature payloads from blob storage. zot no longer copies those layer bytes into MetaDB.

Older MetaDB records may still contain that duplicated content until the repository record is updated again (for example after a pull or a signature change). Verification keeps working either way. You do not need to reclaim disk space for correctness.

If you use a local BoltDB MetaDB (`meta.db` under `storage.rootDirectory`) and the file is large, reclaiming space is optional. Redis and DynamoDB MetaDB backends are not affected by this BoltDB file-size behavior.

**Option A — compact `meta.db` (keeps existing search metadata and user data):**

`bbolt compact` copies every live key and value. It only reclaims space from freelist pages left behind after repository records were rewritten without the old signature payloads. Untouched legacy records still contain those payloads and survive compaction. Prefer this option after normal registry traffic has rewritten the large repos, or use Option B when you need to drop every leftover payload in one step.

1. Install the `bbolt` CLI if needed: `go install go.etcd.io/bbolt/cmd/bbolt@latest` (see [`go.etcd.io/bbolt`](https://pkg.go.dev/go.etcd.io/bbolt)).
2. Stop zot so nothing is writing the database.
3. Change to the storage root directory that contains `meta.db`.
4. Create a compacted copy: `bbolt compact -o meta.db.new meta.db`.
5. Keep a backup, then replace the original: `mv meta.db meta.db.bak && mv meta.db.new meta.db`.
6. Ensure the new file is owned by the zot process user (for example `chown zot:zot meta.db`).
7. Start zot and confirm the registry is healthy.
8. After you are satisfied, remove `meta.db.bak`.

**Option B — recreate `meta.db` (forces a full metadata rebuild):**

> :warning:
> Removing `meta.db` also deletes data that storage cannot rebuild, including API keys, user stars and bookmarks, and download statistics. Keep the backup until you confirm you do not need that state. On start, zot walks storage and rebuilds repository metadata before it becomes ready, so the registry is unavailable for that time. On a large registry the walk can take long enough that a `Type=notify` systemd unit hits its startup timeout; raise `TimeoutStartSec` or use `Type=simple` for that restart if needed.

1. Stop zot.
2. Rename or move `meta.db` aside as a backup (for example `mv meta.db meta.db.bak`).
3. Start zot. It creates a new `meta.db` and rebuilds repository metadata from storage before serving traffic.
4. After you are satisfied, remove the backup.

> :warning:
> Avoid downgrading after the metadata has been rewritten by v2.1.22. Earlier releases can expect signature content to be embedded in MetaDB.

## Enabling image signature verification

To enable image signature verification, add the `trust` attribute under `extensions` in the zot configuration file and enable one or more verification tools, as shown in the following example:

```json
"extensions": {
  "trust": {
    "enable": true,
    "cosign": true,
    "notation": true
  }
}
```

The following table lists the configurable attributes of the `trust` extension.

| Attribute  |Description  |
|------------|-------------|
| `enable`   | If this attribute is missing, signature verification is disabled by default. Signature verification is enabled by including this attribute and setting it to `true`.  You must also enable at least one of the verification tools. |
| `cosign`   | Set to `true` to enable signature verification using the `cosign` tool.  |
| `notation` | Set to `true` to enable signature verification using the `notation` tool.  |


## What is needed for verifying signatures

To verify the validity of a signature for an image, zot makes use of two types of files:

- A public key file that pairs with the private key used to sign an image with `cosign` 

- A certificate file that is used to sign an image with `notation`

Upload these files using an extension of the zot API, as shown in the following examples:

- **To upload a public key for cosign**: 

    *API path*
    ```
    /v2/_zot/ext/cosign"
    ```
    *Example request*
    ```
    curl --data-binary @file.pub "http://localhost:8080/v2/_zot/ext/cosign"
    ```
    *Result*

    The uploaded file is stored in the `_cosign` directory under the `rootDir` specified in the zot configuration file or in the Secrets Manager.

- **To upload a certificate for notation**:

    *API path*
    ```
    /v2/_zot/ext/notation?truststoreType=ca
    ```

    When uploading a certificate, you should specify the `truststoreType`. If the truststore is a certificate authority, the value is `ca`. This is the default if this attribute is omitted.

    *Example request*
    ```
    curl --data-binary @certificate.crt "http://localhost:8080/v2/_zot/ext/notation?truststoreType=ca"
    ```
    *Result*

    The uploaded file is stored in the  `_notation/truststore/x509/{truststoreType}/default` directory under the `rootDir` specified in the zot configuration file or in the Secrets Manager. 

## Where needed files are stored

 Uploaded public keys and certificates are stored in the local filesystem, in specific directories named `_cosign` and `_notation` under `$rootDir`, or in the Secrets Manager.

- The `_cosign` directory contains uploaded public key files in the following structure:

    ```shell
    _cosign
    ├── $publicKey1
    └── $publicKey2
    ```

- The `_notation` directory contains a set of files in the following structure:

    ```shell
    _notation
    ├── trustpolicy.json
	└── truststore
	    └── x509
	        └── $truststoreType
	            └── default
	                └── $certificate
    ```

    In this directory, the `trustpolicy.json` file contains content that is updated automatically whenever a new certificate is added to a new truststore. This content cannot be changed by the user. An example of the `trustpolicy.json` file content is shown below:

    ```json
    {
     "version": "1.0",
      "trustPolicies": [
        {
          "name": "default-config",
          "registryScopes": [ "*" ],
          "signatureVerification": {
            "level" : "strict" 
          },
          "trustStores": ["ca:default", "signingAuthority:default", "tsa:default"],
          "trustedIdentities": [
            "*"
          ]
        }
      ]
    }
    ```

    - By default, the `trustpolicy.json` file sets the `signatureVerification.level` property to `strict`, which enforces all validations. For example, a signature is not trusted if its certificate has expired, even if the certificate verifies the signature.

    - The `trustpolicy.json` file contains three default truststores: `ca:default`, `signingAuthority:default`, and `tsa:default`. The TSA truststore enables verification of signatures that use a trusted timestamp authority. This list of truststores is not updated when a new certificate is uploaded.

    - The content of the `trustStores` field will match the content of the `_notation/truststore` directory.

## How signature verification works

 Based on the uploaded files and the information about images stored in zot's database, signature verification is performed for all signed images. The verification result for each signed image is stored in the database and is visible from GraphQL. The stored information about a signature includes:

- The tool that was used to generate the signature, such as `cosign` or `notation`
- The trustworthiness of the signature, such as whether a certificate or public key exists that can successfully verify the signature
- The author of the signature, which can be either:

    - The public key, for signatures generated using `cosign`
    - The subject of the certificate, for signatures generated using `notation`

## Example of GraphQL output

**Sample request**

```graphql
{
  Image(image: "busybox:latest") {
    Digest
    IsSigned
    Tag
    SignatureInfo {
        Tool
        IsTrusted
        Author
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "Image": {
      "Digest":"sha256:6c19fba547b87bde9a45df2f8563e0c61826d098dd30192a2c8b86da1e1a6360",
      "IsSigned": true,
      "Tag": "latest",
      "SignatureInfo":[
        {
          "Tool":"cosign",
          "IsTrusted":false,
          "Author":""
        },
        {
          "Tool":"cosign",
          "IsTrusted":false,
          "Author":""
        },
        {
          "Tool":"cosign",
          "IsTrusted": true,
          "Author":"-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9pN+/hGcFlh4YYaNvZxNvuh8Qyhl\npURz77qScOHe3DqdmiWiuqIseyhEdjEDwpL6fHRwu3a2Nd9wbKqm0la76w==\n-----END PUBLIC KEY-----\n"
        },
        {
          "Tool":"notation",
          "IsTrusted": false,
          "Author":"CN=v4-test,O=Notary,L=Seattle,ST=WA,C=US"
        },
        {
          "Tool":"notation",
          "IsTrusted": true,
          "Author":"CN=multipleSig,O=Notary,L=Seattle,ST=WA,C=US"
        }
      ]
    }
  }
}
```
