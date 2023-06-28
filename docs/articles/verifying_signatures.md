# Verifying signatures

## What is needed for verifying signatures

In order to check signatures validity, the verification will be performed based on 2 types of files:

1. public keys (which correspond to the private keys used to sign images with `cosign`)

and 

2. certificates (used to sign images with `notation`)

These files should be provided by the user. Basically, the user will be able to upload these files using some exposed routes:
1. ***to upload public keys***: 
    ```
    /v2/_zot/ext/mgmt?resource=signatures&tool=cosign
    ```

    *Example of request*
    ```
    curl --data-binary @file.pub -X POST "http://localhost:8080/v2/_zot/ext/mgmt?resource=signatures&tool=cosign"
    ```

2. ***to upload certificates***:
    ```
    /v2/_zot/ext/mgmt?resource=signatures&tool=notation&truststoreType=ca&truststoreName=upload-cert
    ```

    *Example of request*
    ```
    curl --data-binary @filet.crt -X POST "http://localhost:8080/v2/_zot/ext/mgmt?resource=signatures&tool=notation&truststoreType=ca&truststoreName=upload-cert"
    ```
So the value of `resource` needs to be `signatures` and besides the requested files, the user should also specify the `tool` which should be :
    
- `cosign` for uploading public keys
- `notation` for uploading certificates
 Also, if the uploaded file is a certificate then the user should also specify the type of the trust store through `truststoreType` parameter (if the value of `truststoreType` is not specified then this will be set to `ca` by default) and also its name through `truststoreName` parameter.
## Where needed files are stored

 The files (public keys and certificates) uploaded using the exposed routes will be stored for the moment only on the local filesystem in some specific directories called `_cosign` and `_notation` under `$rootDir` :
   
   - `_cosign` directory will contain the uploaded public keys
        ```
        _cosign
        ├── $publicKey1
	    └── $publicKey2
        ```

   - `_notation` directory will have this structure:

        ```
        _notation
        ├── trustpolicy.json
	    └── truststore
	        └── x509
	            └── $truststoreType
	                └── $truststoreName
	                    └── $certificate
        ```

        where `trustpolicy.json` file has this default content that can not be changed by the user and that is automatically updated every time a new certificate is added to a new `truststore`:
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

        This default `trustpolicy.json` file sets the signatureVerification.level to `strict` which enforces all validations (this means that even if there is a certificate that verifies a signature, but that certificate has expired, then the signature is not trusted).

        Also the content of `trustStores` field will match the content of `truststore` directory, having entries of this format: `$truststoreType:$truststoreName`.

## How signature verification works

 Based on the uploaded files and the information about images stored in BoltDB, signature verification will be performed for all the signed images. Then, the results for each signed image will be stored in BoltDB and will be visible from GraphQL. The information known about the signatures will be:
    
- the tool used to generate the signature (`cosign` or `notation`)
- info about the trustworthiness of the signature (if there is a certificate or a public key which can successfully verify the signature)
- the author of the signature which will be:
    
    - the public key -> for signatures generated using `cosign`
    - the subject of the certificate -> for signatures generated using `notation`

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
