# Using GraphQL for Enhanced Searches

> :point_right: A GraphQL backend server within zot's registry search engine provides efficient and enhanced search capabilities. You can submit a GraphQL structured query as an API call or you can use a browser to access the GraphQL Playground, an interactive graphical environment for GraphQL queries.  

<a name="howto"></a>
## How to use GraphQL for search queries

GraphQL is a query language for APIs. A GraphQL server, as implemented in zot's registry search engine, executes GraphQL queries that match schema recognized by the server. In response, the server returns a structure containing the requested information. The schema currently recognized by zot are those that correspond to the queries listed in [What GraphQL queries are supported](#queries).

> :bulb: To learn more about GraphQL, see these resources:
>
>  - [Introduction to GraphQL](https://graphql.org/learn/)
>
>  - [The Fullstack Tutorial for GraphQL](https://www.howtographql.com/)

To perform a search, compose a GraphQL structured query for a specific search and deliver it to zot using one of the methods described in the following sections.

For examples of GraphQL queries supported in zot, see [Examples of zot searches using GraphQL](#examples).

### Using the search API directly

You can submit a GraphQL structured query as the HTML data payload in a direct API call using a shell tool such as cURL or Postman. GraphQL queries are sent to the zot `search` extension API:

    /v2/_zot/ext/search

The following example submits a zot GraphQL query using cURL:

```shell
curl -X POST -H "Content-Type: application/json" --data '{ "query": "{ ImageListForCVE (id:\"CVE-2002-1119\") { Results { Name Tags } } }" }' http://localhost:8080/v2/_zot/ext/search
```

The reply to your query is returned as a JSON payload in the HTML response.

### Using the GraphQL Playground

> :pencil2: The GraphQL Playground feature is available only in a `binary-debug` zot build or when the zot registry was built with the `debug` extension label.

The GraphQL Playground is an interactive graphical web interface for GraphQL hosted by the zot registry server. 

The GraphQL Playground is reachable by a browser at the following zot API:

    /v2/_zot/debug/graphql-playground#

For example, if your zot server is located at http<nolink>://localhost:8080, the GraphQL Playground can be accessed by your browser at this URL:

    http://localhost:8080/v2/_zot/debug/graphql-playground#
 
In the GraphQL Playground, you can construct and submit a query structure and you can view the query response in a graphical environment in the browser. You can also inspect the schema.

<a name="queries"></a>
## What GraphQL queries are supported

| Supported queries | graphQL query | Input | Output | Description |
| --- | --- | --- | --- | --- |
| [Search images by digest](#search-images-by-digest) | ImageListForDigest | digest | image list | Searches all repositories in the registry and returns list of images that matches given digest (manifest, config or layers) |
| [Search images affected by a given CVE id](#search-images-affected-by-a-given-cve-id) | CVEListForImage | CVE id | image list | Searches the entire registry and returns list of images affected by given CVE | ImagesListForCVE |
| [List CVEs for a given image](#list-cves-of-given-image) | CVEListForImage | image | CVE list | Scans given image and returns list of CVEs affecting the image |
| [List images not affected by a given CVE id](#list-images-not-affected-by-a-given-cve-id) | ImagesListWithCVEFixed| repository, CVE id | image list | Scans all images in a given repository and returns list of latest (by date) images not affected by the given CVE |
| [Latest image from all repos](#list-the-latest-image-across-every-repository) | RepoListWithNewestImage | none | repo summary list | Returns the latest image from all the repos in the registry |
| [List all images with expanded information for a given repository](#list-all-images-with-expanded-information-for-a-given-repository) | ExpandedRepoInfo | repository | repo info | List expanded repo information for all images in repo, alongside a repo summary |
| [All images in repo](#all-images-in-repo) | ImageList | repository | image list | Returns all images in the specified repo |
| [Global search](#global-search) | GlobalSearch | query | image summary / repo summary / layer summary | Will return what's requested in the query argument |
| [Derived image list](#search-derived-images) | DerivedImageList | image | image list | Returns a list of images that depend on the image specified in the argument |
| [Base image list](#search-base-images) | BaseImageList | image | image list | Returns a list of images that the specified image depends on |
| [Get details of a specific image](#get-details-of-a-specific-image) | Image | image | image summary | Returns details about a specific image |
| [Get referrers of a specific image](#get-referrers-of-a-specific-image) | Referrers | repo, digest, type | artifact manifests | Returns a list of artifacts of given type referring to a specific repo and digests |

<a name="examples"></a>
## Examples of zot searches using GraphQL

> :pencil2: These examples show only the GraphQL query without details on how to send them to a server. See [How to use GraphQL for search queries](#howto).

The query structures shown in these examples request all fields allowed by the schema for the particular query type. The schema allows you to request a subset of the data, if desired, omitting any fields that you don't need.


### List CVEs of given image

**Sample request**

```graphql
{
  CVEListForImage(image: "centos:8", requestedPage: {limit: 1, offset:1, sortBy: SEVERITY}) {
    Tag
    Page {
      TotalCount
      ItemCount
    }
    CVEList {
      Id
      Title
      Description
      Severity
      PackageList {
        Name
        InstalledVersion
        FixedVersion
      }
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "CVEListForImage": {
      "Tag": "8",
      "Page": {
        "TotalCount": 292,
        "ItemCount": 1
      },
      "CVEList": [
        {
          "Id": "CVE-2022-24407",
          "Title": "cyrus-sasl: failure to properly escape SQL input allows an attacker to execute arbitrary SQL commands",
          "Description": "In Cyrus SASL 2.1.17 through 2.1.27 before 2.1.28, plugins/sql.c does not escape the password for a SQL INSERT or UPDATE statement.",
          "Severity": "HIGH",
          "PackageList": [
            {
              "Name": "cyrus-sasl-lib",
              "InstalledVersion": "2.1.27-5.el8",
              "FixedVersion": "2.1.27-6.el8_5"
            }
          ]
        }
      ]
    }
  }
}
```

### Search images affected by a given CVE id

**Sample request**

```graphql
{
  ImageListForCVE(id: "CVE-2018-20651") {
    Results{
      RepoName
      Tag
      Digest
      ConfigDigest
      LastUpdated
      IsSigned
      Size
      Platform {
        Os
        Arch
      }
      Vendor
      DownloadCount
      Licenses
      Title
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "ImageListForCVE": [
       {
        "Results": {
          "RepoName": "centos",
          "Tag": "centos8",
          "Digest": "sha256:ac0dc62b48b7f683b49365fecef3b1f4d99fbd249b762e99f13f74938d85a6c8",
          "ConfigDigest": "sha256:98a5843635a2ccc7d72b269923a65721480de929f882143c6c0a0eb43f9a2869",
          "LastUpdated": "2022-10-17T16:36:09.1751694+03:00",
          "IsSigned": true,
          "Size": "83545800",
          "Platform": {
            "Os": "linux",
            "Arch": "amd64"
          },
          "Vendor": "[The CentOS Project](https://github.com/CentOS/sig-cloud-instance-images)\n",
          "Score": null,
          "DownloadCount": 0,
          "Licenses": "View [license information](https://www.centos.org/legal/) for the software contained in this image.",
          "Title": "centos"
        },
      }
    ]
  }
}
```

### List images not affected by a given CVE id

**Sample request**

```graphql
{
  ImageListWithCVEFixed(id: "CVE-2018-20651", image: "ubuntu") {
    Results {
      RepoName
      Tag
      Digest
      ConfigDigest
      LastUpdated
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "ImageListWithCVEFixed": [
      {
        "Results": {
          "RepoName": "ubuntu",
          "Tag": "latest",
          "Digest": "sha256:650d596072ad45c6b74f4923e2cfea8158da2fb3a7b8dbb0b9ae4da3088d0591",
          "ConfigDigest": "sha256:88eef892e29d5b11be933f13424ef885644a6a6978924fedfb51ba555278fe74",
          "LastUpdated": "2022-10-25T01:53:41.769246372Z"
        }
      }
    ]
  }
}
```

### Search images by digest

**Sample request**

```graphql
{
  ImageListForDigest(
    id: "5f34d0bb0261d32d0b0bc91024b7d4e98d94b08a49615e08c8a5a65bc3a7e09f"
  ) {
    Results{
      RepoName
      Tag
      Title
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "ImageListForDigest": [
      {
        "Results": {
          "RepoName": "centos",
          "Tag": "8",
          "Title": "CentOS Base Image"
        }
      }
    ]
  }
}
```

### List the latest image across every repository

**Sample request**

```graphql
{
  RepoListWithNewestImage(requestedPage: {limit: 2, offset:0, sortBy: ALPHABETIC_ASC}) {
    Page {
      TotalCount
      ItemCount
    }
    Results {
      Name
      LastUpdated
      Size
      Platforms {
        Os
        Arch
      }
      NewestImage {
        Digest
        Tag
      }
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "RepoListWithNewestImage": {
      "Page": {
        "TotalCount": 30,
        "ItemCount": 2
      },
      "Results": [
        {
          "Name": "mariadb",
          "LastUpdated": "2022-10-18T14:56:33.1993083+03:00",
          "Size": "124116964",
          "Platforms": [
            {
              "Os": "linux",
              "Arch": "amd64"
            }
          ],
          "NewestImage": {
            "Digest": "sha256:49a299f5c4b1af5bc2aa6cf8e50ab5bad85db4d0095745369acfc1934ece99d0",
            "Tag": "latest"
          }
        },
        {
          "Name": "tomcat",
          "LastUpdated": "2022-10-18T14:55:13.8303866+03:00",
          "Size": "311658063",
          "Platforms": [
            {
              "Os": "linux",
              "Arch": "amd64"
            }
          ],
          "NewestImage": {
            "Digest": "sha256:bbc5a3912b568fbfb5912beaf25054f1f407c32a53acae29f19ad97485731a78",
            "Tag": "jre17"
          }
        }
      ]
    }
  }
}
```

### All images in repo

**Sample request**

```graphql
{
  ImageList (repo: "ubuntu") {
    Results {
      Tag
      Digest
      LastUpdated
      Size
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "ImageList": [
      {
        "Results": 
        {
          "Tag": "latest",
          "Digest": "sha256:650d596072ad45c6b74f4923e2cfea8158da2fb3a7b8dbb0b9ae4da3088d0591",
          "LastUpdated": "2022-10-25T01:53:41.769246372Z",
          "Size": "30426374"
        },
        {
          "Tag": "xenial",
          "Digest": "sha256:34de800b5da88feb7723a87ecbbf238afb63dbfe0c828838e26ac7458bef0ac5",
          "LastUpdated": "2021-08-31T01:21:30.672229355Z",
          "Size": "46499103"
        }
      }
    ]
  }
}
```

### List all images with expanded information for a given repository

**Sample request**

```graphql
{
  ExpandedRepoInfo(repo: "ubuntu") {
    Images {
      Tag
      Digest
    }
    Summary {
      LastUpdated
      Size
      NewestImage {
        Tag
        LastUpdated
        Digest
      }
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "ExpandedRepoInfo": {
      "Images": [
        {
          "Tag": "xenial",
          "Digest": "sha256:34de800b5da88feb7723a87ecbbf238afb63dbfe0c828838e26ac7458bef0ac5"
        },
        {
          "Tag": "latest",
          "Digest": "sha256:650d596072ad45c6b74f4923e2cfea8158da2fb3a7b8dbb0b9ae4da3088d0591"
        }
      ],
      "Summary": {
        "LastUpdated": "2022-10-25T01:53:41.769246372Z",
        "Size": "76929691",
        "NewestImage": {
          "Tag": "latest",
          "LastUpdated": "2022-10-25T01:53:41.769246372Z",
          "Digest": "sha256:650d596072ad45c6b74f4923e2cfea8158da2fb3a7b8dbb0b9ae4da3088d0591"
        }
      }
    }
  }
}
```

### Global search

**Sample request**

```graphql
{
  GlobalSearch(query: "ubuntu:latest") {
    Page {
      ItemCount
      TotalCount
    }
    Images {
      RepoName
      Tag
      LastUpdated
      Layers {
        Size
        Digest
      }
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "GlobalSearch": {
      "Page": {
        "ItemCount": 1,
        "TotalCount": 1
      },
      "Images": [
        {
          "RepoName": "ubuntu",
          "Tag": "latest",
          "LastUpdated": "2022-10-14T18:26:59.6707939+03:00",
          "Layers": [
            {
              "Size": "30428928",
              "Digest": "sha256:cf92e523b49ea3d1fae59f5f082437a5f96c244fda6697995920142ff31d59cf"
            }
          ]
        }
      ]
    }
  }
}
```

**Sample request**

```graphql
{
  GlobalSearch(query: "") {
    Repos {
      Name
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "GlobalSearch": {
      "Repos": [
        {
          "Name": "centos"
        },
        {
          "Name": "ubuntu"
        }
      ]
    }
  }
}
```

### Search derived images

**Sample query**

```graphql
{
  DerivedImageList(image: "ubuntu:latest", requestedPage: {offset: 0, limit: 10}) {
    Page {
      TotalCount
      ItemCount
    }
    Results {
      RepoName
      Tag
      LastUpdated
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "DerivedImageList": {
      "Page": {
        "TotalCount": 9,
        "ItemCount": 9
      },
      "Results": [
        {
          "RepoName": "mariadb",
          "Tag": "latest",
          "LastUpdated": "2022-10-18T14:56:33.1993083+03:00"
        },
        {
          "RepoName": "maven",
          "Tag": "latest",
          "LastUpdated": "2022-10-14T18:30:12.0929807+03:00"
        },
        {
          "RepoName": "tomcat",
          "Tag": "latest",
          "LastUpdated": "2022-10-18T14:50:09.7229959+03:00"
        },
        {
          "RepoName": "tomcat",
          "Tag": "jre17",
          "LastUpdated": "2022-10-18T14:55:13.8303866+03:00"
        },
        {
          "RepoName": "tomcat",
          "Tag": "jre17-temurin",
          "LastUpdated": "2022-10-18T14:54:46.4133521+03:00"
        },
        {
          "RepoName": "tomcat",
          "Tag": "jre17-temurin-jammy",
          "LastUpdated": "2022-10-18T14:51:12.235475+03:00"
        }
      ]
    }
  }
}
```

### Search base images

**Sample query**

```graphql
{
  BaseImageList(image: "mariadb:latest", requestedPage: {offset: 0, limit: 10}) {
    Page {
      TotalCount
      ItemCount
    }
    Results {
      RepoName
      Tag
      LastUpdated
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "BaseImageList": {
      "Page": {
        "TotalCount": 4,
        "ItemCount": 4
      },
      "Results": [
        {
          "RepoName": "ubuntu",
          "Tag": "jammy",
          "LastUpdated": "2022-10-14T18:29:18.0325322+03:00"
        },
        {
          "RepoName": "ubuntu",
          "Tag": "jammy-20221003",
          "LastUpdated": "2022-10-14T18:29:07.0004587+03:00"
        },
        {
          "RepoName": "ubuntu",
          "Tag": "latest",
          "LastUpdated": "2022-10-14T18:26:59.6707939+03:00"
        },
        {
          "RepoName": "ubuntu",
          "Tag": "rolling",
          "LastUpdated": "2022-10-14T18:27:21.2441356+03:00"
        }
      ]
    }
  }
}
```

### Get details of a specific image

**Sample query**

```graphql
{
  Image(image: "mariadb:latest") {
    RepoName
    Tag
    LastUpdated
    Digest
    Description
  }
}
```

**Sample response**

```json
{
  "data": {
    "Image": {
      "RepoName": "mariadb",
      "Tag": "latest",
      "LastUpdated": "2022-10-18T14:56:33.1993083+03:00",
      "Digest": "sha256:49a299f5c4b1af5bc2aa6cf8e50ab5bad85db4d0095745369acfc1934ece99d0",
      "Description": "MariaDB Server is a high performing open source relational database, forked from MySQL."
    }
  }
}
```

### Get referrers of a specific image

**Sample query**

```graphql
{
  Referrers(
    repo: "golang"
    digest: "sha256:fed08b0eaea00aab17f82ecbb78675919d216c72eea985581758191f694aeaf7"
    type: "application/vnd.example.icecream.v1"
  ) {
    MediaType
    ArtifactType
    Digest
    Annotations {
      Key
      Value
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "Referrers": [
      {
        "MediaType": "application/vnd.oci.artifact.manifest.v1+json",
        "ArtifactType": "application/vnd.example.icecream.v1",
        "Digest": "sha256:be7a3d01c35a2cf53c502e9dc50cdf36b15d9361c81c63bf319f1d5cbe44ab7c",
        "Annotations": [
          {
            "Key": "format",
            "Value": "oci"
          },
          {
            "Key": "demo",
            "Value": "true"
          }
        ]
      },
      {
        "MediaType": "application/vnd.oci.artifact.manifest.v1+json",
        "ArtifactType": "application/vnd.example.icecream.v1",
        "Digest": "sha256:d9ad22f41d9cb9797c134401416eee2a70446cee1a8eb76fc6b191f4320dade2",
        "Annotations": [
          {
            "Key": "demo",
            "Value": "true"
          },
          {
            "Key": "format",
            "Value": "oci"
          }
        ]
      }
    ]
  }
}
```