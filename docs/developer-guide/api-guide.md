# Using the zot API

> :point_right: The zot API implements the [OCI Distribution endpoints](https://github.com/opencontainers/distribution-spec/blob/main/spec.md#endpoints) along with endpoints for the supported extensions.

!!! note "Mike's Questions" 

    Does the `ui` extension in the config file enable/disable the API? What is '/' in the API?

    Do we need to document the URL query parameters and API payloads here or should we link to the relevant articles for expanded details?  
    
    Should we at least indicate in the API table that parameters or payloads are supported for each command?

    Is the API syntax finalized for uploading keys and certificates for cosign and notation?


## Viewing the OpenAPI documentation

[OpenAPI](https://www.openapis.org/) (formerly Swagger) provides a standardized format for describing an API. An OpenAPI-conforming API document defines the structure and syntax of the API and can provide a sandbox for executing API commands.

A zot registry incorporates a built-in OpenAPI document.  To view the document, go to the following URL:

    http://<zotregistry>/swagger/v2/

For example:

    http://localhost:8080/swagger/v2/

> :pencil2: You must include the trailing `/`.

## API authentication

When pushing and pulling images using API calls, your identity can be authenticated by either a password or an API key. An API key has advantages in situations where the primary zot authentication does not use the command line, such as a GUI login or social login. Also, you can reduce your security exposure by using an API key instead of your broader credentials, such as an LDAP username and password.


### Using API keys

#### Enabling API keys

To enable the use of API keys, you must set the `apikey` attribute to `true` in the zot configuration file, as shown in the following example:

```json
  "http": {
    "auth": {
      "apikey": true
    }
  }
```

#### Creating an API key

Before you can create or revoke an API key, you must first log in using a different authentication mechanism, such as logging in through the zot GUI. Once you are logged in, you can create an API key for your identity with the following API command:

    POST /auth/apikey

For example, using cURL:

    curl -u user:password -X POST http://localhost:8080/auth/apikey -d '{"label": "myAPIKEY", "scopes": ["repo1", "repo2"], "expirationDate": "2023-08-28T17:10:05+03:00"}'

In this example, the command output would be:

```json
{
  "createdAt":"2023-08-28T17:09:59.2603515+03:00",
  "expirationDate":"2023-08-28T17:10:05+03:00",
  "isExpired":false,
  "creatorUa":"curl/7.68.0",
  "generatedBy":"manual",
  "lastUsed":"0001-01-01T00:00:00Z",
  "label":"myAPIKEY",
  "scopes": [
    "repo1",
    "repo2"
  ],
  "uuid":"c931e635-a80d-4b52-b035-6b57be5f6e74",
  "apiKey":"zak_ac55a8693d6b4370a2003fa9e10b3682"
}
```

> :pencil2: The API key (`apiKey`) is shown to the user only in the command output when it is created. It cannot be retrieved from zot with any other command.

> :pencil2: The scopes and expiration date in this example are optional. By default, an API key has the same permissions as the user who created it.

#### Using an API key in an API command

The API key replaces a password in the API command, as shown in the following cURL example:

    curl -u user:zak_e77bcb9e9f634f1581756abbf9ecd269 http://localhost:8080/v2/_catalog


#### Removing an API key

When logged in, you can revoke your own API key with the following API command:

    DELETE /auth/apikey?id=$uuid

For example, using cURL:

    curl -u user:password -X DELETE http://localhost:8080/v2/auth/apikey?id=46a45ce7-5d92-498a-a9cb-9654b1da3da1


#### Listing your current API keys

When logged in, you can display a list of your API keys with the following API command:

    GET /auth/apikey

For example, using cURL:

    curl -u user:password -X GET http://localhost:8080/auth/apikey 

The following command output example shows information about two keys for this user:

```json
{
  "apiKeys": [
    {
      "createdAt": "2023-05-05T15:39:28.420926+03:00",
      "expirationDate": "0001-01-01T00:00:00Z",
      "isExpired": true,
      "creatorUa": "curl/7.68.0",
      "generatedBy": "manual",
      "lastUsed": "0001-01-01T00:00:00Z",
      "label": "git",
      "scopes": [
        "repo1",
        "repo2"
      ],
      "uuid": "46a45ce7-5d92-498a-a9cb-9654b1da3da1"
    },
    {
      "createdAt": "2023-08-11T14:43:00.6459729+03:00",
      "expirationDate": "2023-08-17T18:24:05+03:00",
      "isExpired": false,
      "creatorUa": "curl/7.68.0",
      "generatedBy": "manual",
      "lastUsed": "2023-08-11T14:43:47.5559998+03:00",
      "label": "myAPIKEY",
      "scopes": null,
      "uuid": "294abf69-b62f-4e58-b214-dad2aec0bc52"
    }
  ]
}
```

> :pencil2: The actual API key (`apiKey`) is not shown. The key is shown to the user only when it is created. 


## API endpoints reference

The following is a list of zot API endpoints along with the conditions under which each endpoint is available.

> :pencil2: Some API endpoints are available only when a specific extension is enabled in the zot configuration file, or when an extension build label is specified in the `make` command (for example, `make binary EXTENSIONS=ui`), or both.

| Endpoint | Description | Availability |
| --- | ------------ | -------- |
| / | UI | Enabled by using the `ui` build label and enabling the `ui` extension in the configuration file. |
| /auth/login | With query parameters, opens an API session | Enabled by using the `ui` build label and enabling the `ui` extension in the configuration file. |
| /auth/logout | Ends an API session | Available when authentication is available. This includes not only OpenID, but all session-based authentication. |
| /auth/apikey | With query parameters, creates, lists, or deletes API keys | Available when API key authentication is enabled in the configuration file ("apikey": true). |
| /auth/callback | Redirects a login to a provider service | Available when OpenID authentication is enabled in the configuration file. |
| /oras/artifacts/v1/ | ORAS endpoints | Always enabled. |
| /metrics | Displays extended metrics | Available when the `metrics` build label is used and the `metrics` extension is enabled  in the configuration file. |
| /swagger/v2/ | Displays the OpenAPI (formerly Swagger) documentation  | Enabled by using the `debug` build label (`make binary-debug`).
| /v2/ | [OCI specification endpoints](https://github.com/opencontainers/distribution-spec/blob/main/spec.md#endpoints) | Always available. |
| /v2/_oci/ext/discover | Discover extensions per the OCI specification | Always available. |
| /v2/metrics | Displays basic metrics | Available when the `metrics` extension is disabled, whether or not the `metrics` build label was used. |
| /v2/_zot/ext/mgmt | Mgmt extension endpoints | Enabled by using the `mgmt` build label and enabling both the `search` and `ui` extensions in the configuration file. |
| /v2/_zot/ext/cosign | Uploads keys for signature verification | Enabled by using the `imagetrust` build label and enabling the `trust` extension with the `cosign` option enabled. |
| /v2/_zot/ext/notation | With query parameters, uploads certificates for signature verification | Enabled by using the `imagetrust` build label and enabling the `trust` extension with the `notation` option enabled. |
| /v2/_zot/ext/search | Enhanced search | Enabled by using the `search` build label and enabling the `search` extension in the configuration file. |
| /v2/_zot/ext/userprefs | User preferences endpoints | Enabled by using the `userprefs` build label and enabling both the `search` and the `ui` extensions in the configuration file. |
| /v2/_zot/debug/graphql-playground | [GraphQL](https://graphql.org/) playground | Enabled by using the `debug` build label. |

