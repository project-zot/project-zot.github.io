# Verifying image signatures

Images stored in zot can be signed with a digital signature to verify the source and integrity of the image. The digital signature can be verified by zot using public keys or certificates uploaded by the user.

To verify image signatures, zot supports the following tools:

- [cosign](https://docs.sigstore.dev/cosign/overview/)
- [notation](https://github.com/notaryproject/notation)

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
    curl --data-binary @file.pub -X POST "http://localhost:8080/v2/_zot/ext/cosign"
    ```
    *Result*

    The uploaded file is stored in the `_cosign` directory under the `rootDir` specified in the zot configuration file or in the Secrets Manager.

- **To upload a certificate for notation**:

    *API path*
    ```
    /v2/_zot/ext/notation?truststoreType=ca
    ```

    When uploading a certificate, you should specify the `truststoreType`. If the truststore is a certificate authority, the values is `ca`. This is the default if this attribute is omitted.

    *Example request*
    ```
    curl --data-binary @certificate.crt -X POST "http://localhost:8080/v2/_zot/ext/notation?truststoreType=ca"
    ```
    *Result*

    The uploaded file is stored in the  `_notation/truststore/x509/{truststoreType}/default` directory under the `rootDir` specified in the zot configuration file or in the Secrets Manager. The `truststores` field in the  `_notation/trustpolicy.json` file is updated automatically.

## Where needed files are stored

 Uploaded public keys and certificates are currently stored only in the local filesystem, in specific directories named `_cosign` and `_notation` under `$rootDir`.

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
          "trustStores": [],
          "trustedIdentities": [
            "*"
          ]
        }
      ]
    }
    ```

    By default, the `trustpolicy.json` file sets the `signatureVerification.level` property to `strict`, which enforces all validations. For example, a signature is not trusted if its certificate has expired, even if the certificate verifies the signature.

    The content of the `trustStores` field will match the content of the `_notation/truststore` directory.

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