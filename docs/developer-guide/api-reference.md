# zot API Command Reference

> :point_right: This article describes the zot REST API commands, parameters, and responses.

The information presented here is adapted from the interactive OpenAPI (formerly swagger) [JSON file](https://github.com/project-zot/zot/blob/main/swagger/swagger.json) in the zot Github project.

For instructions and examples of how to use the zot API, see [Using the zot API](../developer-guide/api-user-guide.md).

> :bulb: **Note:** zot also provides a GraphQL API for enhanced search capabilities. For details on using GraphQL queries, see [Using GraphQL for Enhanced Searches](../articles/graphql.md).


## /zot/auth/apikey

### DELETE `/zot/auth/apikey`

Revokes one current user API key based on given key ID

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|query|string|true|api token id (UUID)|

*Example responses*

200 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ok|string|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|bad request|string|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|unauthorized|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

This operation does not require authentication

### GET `/zot/auth/apikey`

Get list of all API keys for a logged in user

*Example responses*

200 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ok|string|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|unauthorized|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

This operation does not require authentication


### POST `/zot/auth/apikey`

Can create an api key for a logged in user, based on the provided label and scopes.

> Body parameter

```json
{
  "expirationDate": "string",
  "label": "string",
  "scopes": [
    "string"
  ]
}
```

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[api.APIKeyPayload](#schemaapi.apikeypayload)|true|api token id (UUID)|

*Example responses*

201 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|created|string|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|bad request|string|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|unauthorized|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

This operation does not require authentication

## `/zot/auth/logout`

### POST `/zot/auth/logout`

Logout by removing current session

*Example responses*

200 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ok".|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error".|string|

This operation does not require authentication

## `/oras/artifacts/v1/{name}/manifests/{digest}/referrers`

### GET `/oras/artifacts/v1/{name}/manifests/{digest}/referrers`

Get references for an image given a digest and artifact type

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|digest|path|string|true|image digest|
|artifactType|query|string|true|artifact type|

*Example responses*

200 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ok|string|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|not found|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

This operation does not require authentication

## `/v2/`

### GET `/v2/`

Check if this API version is supported

*Example responses*

200 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ok".|string|

This operation does not require authentication

## `/v2/_catalog`

### GET `/v2/_catalog`

List all image repositories

*Example responses*

200 Response

```json
{
  "repositories": [
    "string"
  ]
}
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[api.RepositoryList](#schemaapi.repositorylist)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

This operation does not require authentication

## `/v2/_oci/ext/discover`

### GET `/v2/_oci/ext/discover`

List all extensions present on registry

*Example responses*

200 Response

```json
{
  "extensions": [
    {
      "description": "string",
      "endpoints": [
        "string"
      ],
      "name": "string",
      "url": "string"
    }
  ]
}
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[api.ExtensionList](#schemaapi.extensionlist)|

This operation does not require authentication

## `/v2/_zot/ext/cosign`

### POST `/v2/_zot/ext/cosign`

Upload cosign public keys for verifying signatures

> Body parameter

```yaml
string

```

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|string|true|Public key content|

*Example responses*

200 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ok|string|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|bad request".|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error".|string|

This operation does not require authentication

## `/v2/_zot/ext/mgmt`

### GET `/v2/_zot/ext/mgmt`

Get current server configuration

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|resource|query|string|false|specify resource|

*Enumerated Values*

|Parameter|Value|
|---|---|
|resource|config|

*Example responses*

200 Response

```json
{
  "binaryType": "string",
  "distSpecVersion": "string",
  "http": {
    "auth": {
      "bearer": {
        "realm": "string",
        "service": "string"
      },
      "htpasswd": {
        "path": "string"
      },
      "ldap": {
        "address": "string"
      },
      "openid": {
        "providers": {
          "property1": {
            "name": "string"
          },
          "property2": {
            "name": "string"
          }
        }
      }
    }
  }
}
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[extensions.StrippedConfig](#schemaextensions.strippedconfig)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error".|string|

This operation does not require authentication

## `/v2/_zot/ext/notation`

### POST `/v2/_zot/ext/notation`

Upload notation certificates for verifying signatures

> Body parameter

```yaml
string

```

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|truststoreType|query|string|false|truststore type|
|body|body|string|true|Certificate content|

*Example responses*

200 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ok|string|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|bad request".|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error".|string|

This operation does not require authentication

## `/v2/_zot/ext/userprefs`

### PUT `/v2/_zot/ext/userprefs`

Add bookmarks/stars info

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|action|query|string|true|specify action|
|repo|query|string|true|repository name|

*Enumerated Values*

|Parameter|Value|
|---|---|
|action|toggleBookmark|
|action|toggleStar|

*Example responses*

200 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ok|string|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|bad request".|string|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|forbidden|string|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|not found|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

This operation does not require authentication

## `/v2/{name}/blobs/{digest}`

### DELETE `/v2/{name}/blobs/{digest}`

Delete an image's blob/layer given a digest

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|digest|path|string|true|blob/layer digest|

*Example responses*

202 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|202|[Accepted](https://tools.ietf.org/html/rfc7231#section-6.3.3)|accepted|string|

This operation does not require authentication

### GET `/v2/{name}/blobs/{digest}`

Get an image's blob/layer given a digest

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|digest|path|string|true|blob/layer digest|

*Example responses*

200 Response

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[api.ImageManifest](#schemaapi.imagemanifest)|

This operation does not require authentication

### HEAD `/v2/{name}/blobs/{digest}`

Check an image's blob/layer given a digest

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|digest|path|string|true|blob/layer digest|

*Example responses*

200 Response

```json
{
  "annotations": {
    "property1": "string",
    "property2": "string"
  },
  "artifactType": "string",
  "config": {
    "annotations": {
      "property1": "string",
      "property2": "string"
    },
    "artifactType": "string",
    "data": [
      0
    ],
    "digest": "string",
    "mediaType": "string",
    "platform": {
      "architecture": "string",
      "os": "string",
      "os.features": [
        "string"
      ],
      "os.version": "string",
      "variant": "string"
    },
    "size": 0,
    "urls": [
      "string"
    ]
  },
  "layers": [
    {
      "annotations": {
        "property1": "string",
        "property2": "string"
      },
      "artifactType": "string",
      "data": [
        0
      ],
      "digest": "string",
      "mediaType": "string",
      "platform": {
        "architecture": "string",
        "os": "string",
        "os.features": [
          "string"
        ],
        "os.version": "string",
        "variant": "string"
      },
      "size": 0,
      "urls": [
        "string"
      ]
    }
  ],
  "mediaType": "string",
  "schemaVersion": 0,
  "subject": {
    "annotations": {
      "property1": "string",
      "property2": "string"
    },
    "artifactType": "string",
    "data": [
      0
    ],
    "digest": "string",
    "mediaType": "string",
    "platform": {
      "architecture": "string",
      "os": "string",
      "os.features": [
        "string"
      ],
      "os.version": "string",
      "variant": "string"
    },
    "size": 0,
    "urls": [
      "string"
    ]
  }
}
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[api.ImageManifest](#schemaapi.imagemanifest)|

*Response Headers*

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|constants.DistContentDigestKey|object||none|

This operation does not require authentication

## `/v2/{name}/blobs/uploads`

### POST `/v2/{name}/blobs/uploads`

Create a new image blob/layer upload

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|

*Example responses*

202 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|202|[Accepted](https://tools.ietf.org/html/rfc7231#section-6.3.3)|accepted|string|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|unauthorized|string|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|not found|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

*Response Headers*

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|202|Location|string||/v2/{name}/blobs/uploads/{session_id}|
|202|Range|string||0-0|

This operation does not require authentication

## `/v2/{name}/blobs/uploads/{session_id}`

### DELETE `/v2/{name}/blobs/uploads/{session_id}`

Delete an image's blob/layer given a digest

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|session_id|path|string|true|upload session_id|

*Example responses*

200 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ok|string|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|not found|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

This operation does not require authentication

### GET `/v2/{name}/blobs/uploads/{session_id}`

*Get an image's blob/layer upload given a session_id

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|session_id|path|string|true|upload session_id|

*Example responses*

204 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|no content|string|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|not found|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

This operation does not require authentication

### PATCH `/v2/{name}/blobs/uploads/{session_id}`

Resume an image's blob/layer upload given an session_id

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|session_id|path|string|true|upload session_id|

*Example responses*

202 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|202|[Accepted](https://tools.ietf.org/html/rfc7231#section-6.3.3)|accepted|string|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|bad request|string|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|not found|string|
|416|[Range Not Satisfiable](https://tools.ietf.org/html/rfc7233#section-4.4)|range not satisfiable|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

*Response Headers*

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|202|Location|string||/v2/{name}/blobs/uploads/{session_id}|
|202|Range|string||0-128|

This operation does not require authentication

### PUT `/v2/{name}/blobs/uploads/{session_id}`

Update and finish an image's blob/layer upload given a digest

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|session_id|path|string|true|upload session_id|
|digest|query|string|true|blob/layer digest|

*Example responses*

201 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|created|string|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|not found|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

This operation does not require authentication

## `/v2/{name}/manifests/{reference}`

### DELETE `/v2/{name}/manifests/{reference}`

Delete an image's manifest given a reference or a digest

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|reference|path|string|true|image reference or digest|

*Example responses*

200 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ok|string|

This operation does not require authentication

### GET `/v2/{name}/manifests/{reference}`

Get an image's manifest given a reference or a digest

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|reference|path|string|true|image reference or digest|

*Example responses*

200 Response

```json
{
  "annotations": {
    "property1": "string",
    "property2": "string"
  },
  "artifactType": "string",
  "config": {
    "annotations": {
      "property1": "string",
      "property2": "string"
    },
    "artifactType": "string",
    "data": [
      0
    ],
    "digest": "string",
    "mediaType": "string",
    "platform": {
      "architecture": "string",
      "os": "string",
      "os.features": [
        "string"
      ],
      "os.version": "string",
      "variant": "string"
    },
    "size": 0,
    "urls": [
      "string"
    ]
  },
  "layers": [
    {
      "annotations": {
        "property1": "string",
        "property2": "string"
      },
      "artifactType": "string",
      "data": [
        0
      ],
      "digest": "string",
      "mediaType": "string",
      "platform": {
        "architecture": "string",
        "os": "string",
        "os.features": [
          "string"
        ],
        "os.version": "string",
        "variant": "string"
      },
      "size": 0,
      "urls": [
        "string"
      ]
    }
  ],
  "mediaType": "string",
  "schemaVersion": 0,
  "subject": {
    "annotations": {
      "property1": "string",
      "property2": "string"
    },
    "artifactType": "string",
    "data": [
      0
    ],
    "digest": "string",
    "mediaType": "string",
    "platform": {
      "architecture": "string",
      "os": "string",
      "os.features": [
        "string"
      ],
      "os.version": "string",
      "variant": "string"
    },
    "size20": 0,
    "urls": [
      "string"
    ]
  }
}
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[api.ImageManifest](#schemaapi.imagemanifest)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|not found|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

*Response Headers*

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|constants.DistContentDigestKey|object||none|

This operation does not require authentication

### HEAD `/v2/{name}/manifests/{reference}`

Check an image's manifest given a reference or a digest

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|reference|path|string|true|image reference or digest|

*Example responses*

200 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ok|string|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|not found|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error".|string|

*Response Headers*

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|constants.DistContentDigestKey|object||none|

This operation does not require authentication

### PUT `/v2/{name}/manifests/{reference}`

Update an image's manifest given a reference or a digest

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|reference|path|string|true|image reference or digest|

*Example responses*

201 Response

```json
"string"
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|created|string|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|bad request|string|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|not found|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

This operation does not require authentication

## `/v2/{name}/referrers/{digest}`

### GET `/v2/{name}/referrers/{digest}`

Get referrers given a digest

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|digest|path|string|true|digest|
|artifactType|query|string|false|artifact type|

*Example responses*

200 Response

```json
{
  "annotations": {
    "property1": "string",
    "property2": "string"
  },
  "artifactType": "string",
  "manifests": [
    {
      "annotations": {
        "property1": "string",
        "property2": "string"
      },
      "artifactType": "string",
      "data": [
        0
      ],
      "digest": "string",
      "mediaType": "string",
      "platform": {
        "architecture": "string",
        "os": "string",
        "os.features": [
          "string"
        ],
        "os.version": "string",
        "variant": "string"
      },
      "size": 0,
      "urls": [
        "string"
      ]
    }
  ],
  "mediaType": "string",
  "schemaVersion": 0,
  "subject": {
    "annotations": {
      "property1": "string",
      "property2": "string"
    },
    "artifactType": "string",
    "data": [
      0
    ],
    "digest": "string",
    "mediaType": "string",
    "platform": {
      "architecture": "string",
      "os": "string",
      "os.features": [
        "string"
      ],
      "os.version": "string",
      "variant": "string"
    },
    "size": 0,
    "urls": [
      "string"
    ]
  }
}
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[api.ImageIndex](#schemaapi.imageindex)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|not found|string|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|internal server error|string|

This operation does not require authentication

## `/v2/{name}/tags/list`

### GET `/v2/{name}/tags/list`

List all image tags in a repository

*Parameters*

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|name|path|string|true|repository name|
|n|query|integer|true|limit entries for pagination|
|last|query|string|true|last tag value for pagination|

*Example responses*

200 Response

```json
{
  "name": "string",
  "tags": [
    "string"
  ]
}
```

*Responses*

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[common.ImageTags](#schemacommon.imagetags)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|bad request".|string|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|not found|string|

This operation does not require authentication
