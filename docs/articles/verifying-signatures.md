# Verifying image signatures

## What is needed for verifying signatures

To verify the validity of a signature for an image, zot makes use of two types of files:

- A public key file that pairs with the private key used to sign an image with `cosign` 

- A certificate file that is used to sign an image with `notation`

These files can be uploaded by the user using the `mgmt` extension of the zot API, as shown in the following examples:

1. **To upload a public key**: 

    *API path*
    ```
    /v2/_zot/ext/mgmt?resource=signatures&tool=cosign
    ```
    *Example request*
    ```
    curl --data-binary @file.pub -X POST "http://localhost:8080/v2/_zot/ext/mgmt?resource=signatures&tool=cosign"
    ```

2. **To upload a certificate**:

    *API path*
    ```
    /v2/_zot/ext/mgmt?resource=signatures&tool=notation&truststoreType=ca&truststoreName=upload-cert
    ```
    *Example request*
    ```
    curl --data-binary @filet.crt -X POST "http://localhost:8080/v2/_zot/ext/mgmt?resource=signatures&tool=notation&truststoreType=ca&truststoreName=upload-cert"
    ```

The value of `resource` must be `signatures`. In addition to the requested files, the user must also specify the `tool`, which must be one of the following:
    
   - `cosign` for uploading public keys
   - `notation` for uploading certificates

If the uploaded file is a certificate, the user should specify these additional attributes describing the truststore:

   - `truststoreType`: If the truststore is a certificate authority, the values is `ca`. This is the default if the attribute is omitted.

   - `truststoreName`: The name of the truststore.

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
	            └── $truststoreName
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

    The content of the `trustStores` field will match the content of the `_notation/truststore` directory, containing entries of this format: `$truststoreType:$truststoreName`.

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