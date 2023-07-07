# Verifying image signatures

## What is needed for verifying signatures

To verify the validity of a signature for an image, zot makes use of two types of files:

- A public key file that pairs with the private key used to sign an image with `cosign` 

- A certificate file that is used to sign an image with `notation`

These files are uploaded by the user.

> :pencil2: The procedure for uploading these files by a user has not yet been finalized at the time of this writing.

## Where needed files are stored

 Uploaded public keys and certificates are currently stored only in the local filesystem, in specific directories named `_cosign` and `_notation` under `$rootDir`.

   - The `_cosign` directory contains uploaded public key files in the following structure:
        ```
        _cosign
        ├── $publicKey1
	    └── $publicKey2
        ```

   - The `_notation` directory contains a set of files in the following structure:

        ```
        _notation
        ├── trustpolicy.json
	    └── truststore
	        └── x509
	            └── $truststoreType
	                └── $truststoreName
	                    └── $certificate
        ```

        In this directory, the `trustpolicy.json` file contains content that is updated automatically whenever a new certificate is added to a new truststore. This content cannot be changed by the user. An example of the `trustpolicy.json` file content is shown below:
        ```
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

    - the public key, for signatures generated using `cosign`
    - the subject of the certificate, for signatures generated using `notation`

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