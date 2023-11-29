# Using the zot API

> :point_right: This document describes how to use the zot REST API and provides a number of examples. 

For comprehensive details of all zot API commands, see [Viewing the complete zot API reference](#_find_reference).

The zot API implements the [OCI Distribution endpoints](https://github.com/opencontainers/distribution-spec/blob/main/spec.md#endpoints) along with additional endpoints for supported extensions. You can access the REST API at the same URL and port number used by the GUI and by datapath tools.

> :pencil2: The examples in this article assume that the zot registry is located at `localhost:8080`.


## Supported API endpoints

The following is a list of zot API endpoints along with the conditions under which each endpoint is available.

> :pencil2: Some API endpoints are available only when a specific extension is enabled in the zot configuration file, or when an extension build label is specified in the `make` command (for example, `make binary EXTENSIONS=ui`), or both.

For comprehensive details of the API endpoints, see [Viewing the complete zot API reference](#_find_reference).

### OCI endpoints

| Endpoint | Actions | Description | 
| -------- | ------- | ----------- | 
| /v2/| GET | [OCI specification endpoints](https://github.com/opencontainers/distribution-spec/blob/main/spec.md#endpoints) | 
| /v2/_catalog| GET | Lists repositories in a registry. |
| /v2/_oci/ext/discover| GET | Discover extensions per the OCI specification | 
| /v2/{repo}/blobs/{digest}| DELETE, GET, HEAD | Lists or deletes an image's blob/layer given a digest | 
| /v2/{repo}/blobs/uploads| POST | Creates an image blob/layer upload | 
| /v2/{repo}/blobs/uploads/{session_id}| DELETE, GET, PATCH, PUT | Creates, lists, or deletes an image's blob/layer upload given a session_id | 
| /v2/{repo}/manifests/{reference}| DELETE, GET, HEAD, PUT | Creates, lists, or deletes references for an image | 
| /v2/{repo}/referrers/{digest}| GET | Lists referrers given a digest | 
| /v2/{repo}/tags/list | GET | List all image tags in a repository | 


### zot OCI extension endpoints

| Endpoint | Actions | Description | Availability |
| -------- | ------- | ----------- | -------------|
| /v2/_zot/ext/mgmt| GET | Mgmt extension endpoints | Enabled by using the `mgmt` build label and enabling the `search` extension in the configuration file. |
| /v2/_zot/ext/notation| POST | With query parameters, uploads certificates for signature verification | Enabled by using the `imagetrust` build label and enabling the `trust` extension with the `notation` option enabled. |
| /v2/_zot/ext/search |  | Enhanced search | Enabled by using the `search` build label and enabling the `search` extension in the configuration file. |
| /v2/_zot/ext/cosign| POST | Uploads keys for signature verification | Enabled by using the `imagetrust` build label and enabling the `trust` extension with the `cosign` option enabled. |
| /v2/_zot/ext/userprefs| PUT | User preferences endpoints | Enabled by using the `userprefs` build label and enabling both the `search` and the `ui` extensions in the configuration file. |


### zot auth endpoints

| Endpoint | Actions | Description | Availability |
| -------- | ------- | ----------- | -------------|
| /zot/auth/apikey| DELETE, GET, POST | Creates, lists, or deletes API keys | Available when API key authentication is enabled in the configuration file (`"apikey": true`). |
| /zot/auth/login | POST  | Opens an API session | Available when authentication is available. This includes not only OpenID, but all session-based authentication. |
| /zot/auth/logout| POST  | Ends an API session | Available when authentication is available. This includes not only OpenID, but all session-based authentication. 
| /zot/auth/callback/\<provider\> | POST | Specifies a social authentication service provider for redirecting logins, such as Google or dex. | Enabled when an OpenID authentication service provider is specified in the configuration file. |


### other zot endpoints

| Endpoint | Actions | Description | Availability |
| -------- | ------- | ----------- | -------------|
| /v2/_zot/pprof/ | GET | Returns a current HTML-format profile list along with a count of currently available records for each profile. See [Performance Profiling in zot](../articles/pprofiling.md) for usage details. | Always enabled. |
| /v2/_zot/debug/graphql-playground# |  | See [Using GraphQL](../articles/graphql.md) for details. | Enabled only in a `binary-debug` zot build or when the zot registry has been built with the `debug` extension label. |


### ORAS endpoints

| Endpoint | Actions | Description | Availability |
| -------- | ------- | ----------- | -------------|
| /oras/artifacts/v1/{repo}/ \ manifests/{digest}/referrers | GET | [OCI Registry As Storage (ORAS)](https://oras.land/) endpoints | Always enabled. |

### prometheus endpoint

| Endpoint | Actions | Description | Availability |
| -------- | ------- | ----------- | -------------|
| /metrics | GET | Returns extended metrics for monitoring by prometheus | Enabled when the `metrics` extension is enabled in the configuration file. | 

### OpenAPI (swagger) endpoints

> :pencil2: This endpoint is accessed with a browser. 

| Endpoint | Action | Description | Availability |
| -------- | ------ | ----------- | -------------|
| /swagger/v2/ | (browser) | Displays an interactive OpenAPI (swagger) API reference. | Enabled only in a `binary-debug` zot build or when the zot registry has been built with the `debug` extension label. |


## API authentication

> :pencil2: If [zot authentication](../articles/authn-authz.md) is not configured, any user can access the zot API.

When pushing and pulling images using API calls, your identity can be authenticated by either a password or an API key. 

With a valid password, you can specify your credentials in a cURL request as shown in this example:

    curl -u <user>:<password> -X GET http://<server>/<endpoint>

An API key has advantages in situations where the primary zot authentication does not use the command line, such as a GUI login or social login. Also, you can reduce your security exposure by using an API key instead of your broader credentials, such as an LDAP username and password.


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

#### Creating your API key

Before you can create or revoke an API key, you must first log in using a different authentication mechanism, such as logging in through the zot GUI. When you are logged in, you can create an API key for your identity using the following API command:

    POST /zot/auth/apikey

_cURL command example:_

    curl -u user:password -X POST http://localhost:8080/zot/auth/apikey -d '{"label": "myAPIKEY", "scopes": ["repo1", "repo2"], "expirationDate": "2023-08-28T17:10:05+03:00"}'

> :pencil2: The scopes and expiration date in this example are optional. By default, an API key has the same permissions as the user who created it.

_Command output:_

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

> :pencil2: The API key (`apiKey`) is shown to the user only in the command output when the key is created. It cannot be later retrieved from zot with any other command.


#### Using your API key in an API command

The API key replaces a password in the API command, as shown in the following cURL example:

    curl -u user:zak_e77bcb9e9f634f1581756abbf9ecd269 http://localhost:8080/v2/_catalog


#### Removing your API key

When logged in, you can revoke your own API key with the following API command:

    DELETE /zot/auth/apikey?id=$uuid

_cURL command example:_

    curl -u user:password -X DELETE http://localhost:8080/v2/zot/auth/apikey?id=46a45ce7-5d92-498a-a9cb-9654b1da3da1


#### Listing your current API keys

When logged in, you can display a list of your API keys with the following API command:

    GET /zot/auth/apikey

_cURL command example:_

    curl -u user:password -X GET http://localhost:8080/zot/auth/apikey 

_Command output:_

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

This command output example shows an expired key and a current key for this user.

> :pencil2: The actual API key (`apiKey`) is not shown. The key is shown to the user only when it is created. 

## API examples

> :pencil2: The following examples assume that the zot registry is located at `localhost:8080`.

### Listing repositories

To get a list of all image repositories in the registry, use the following API endpoint:

    GET /v2/_catalog

_cURL command example:_

    curl -X GET http://localhost:8080/v2/_catalog

_Command output:_

```json
{
    "repositories": ["alpine", "busybox"]
}

```

### Discovering extension endpoints

To list the installed and enabled zot extensions that can be accessed through the API, use the following OCI API endpoint:

    GET /v2/_oci/ext/discover

_cURL command example:_

    curl -X GET http://localhost:8080/v2/_oci/ext/discover 

_Command output:_

```json
{
  "extensions": [
  {
    "name": "_zot",
    "url": "https://github.com/project-zot/zot/blob//pkg/extensions/_zot.md",
    "description": "zot registry extensions",
    "endpoints": ["/v2/_zot/ext/search", "/v2/_zot/ext/userprefs", "/v2/_zot/ext/mgmt"]
  }]
}

```

### Uploading a certificate for Notation

To upload a certificate for notation, use the following endpoint:

    POST /v2/_zot/ext/notation

_cURL command example:_

    curl --data-binary @certificate.crt -X POST "http://localhost:8080/v2/_zot/ext/notation?truststoreType=ca"


<a name="_find_reference"></a>

## Viewing the complete zot API reference

You can find comprehensive details of all zot API commands in either of the following locations:

- As text descriptions in the [zot API Command Reference](../developer-guide/api-reference.md) in the zot documentation.

- As an interactive OpenAPI (swagger) [JSON file](https://github.com/project-zot/zot/blob/main/swagger/swagger.json) in the zot Github project.

  There are many ways to view a swagger file as an interactive document. If you have the `npm` package installed, for example, you can execute the following command:

      $ npx open-swagger-ui swagger.json

  This command creates a local web server at `localhost:3355` where you can interact with the API reference using a browser.
