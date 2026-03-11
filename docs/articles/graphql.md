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

For example, if your zot server is located at `http://localhost:8080`, the GraphQL Playground can be accessed by your browser at this URL:

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
  CVEListForImage(
    image: "alpine:3.17"
    requestedPage: {limit: 1, offset:1, sortBy: SEVERITY}
  ) {
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
      "Tag": "3.17",
      "Page": {
        "TotalCount": 9,
        "ItemCount": 1
      },
      "CVEList": [
        {
          "Id": "CVE-2023-5363",
          "Title": "openssl: Incorrect cipher key and IV length processing",
          "Description": "Issue summary: A bug has been identified in the processing of key and\ninitialisation vector (IV) lengths.  This can lead to potential truncation\nor overruns during the initialisation of some symmetric ciphers.\n\nImpact summary: A truncation in the IV can result in non-uniqueness,\nwhich could result in loss of confidentiality for some cipher modes.\n\nWhen calling EVP_EncryptInit_ex2(), EVP_DecryptInit_ex2() or\nEVP_CipherInit_ex2() the provided OSSL_PARAM array is processed after\nthe key and IV have been established.  Any alterations to the key length,\nvia the \"keylen\" parameter or the IV length, via the \"ivlen\" parameter,\nwithin the OSSL_PARAM array will not take effect as intended, potentially\ncausing truncation or overreading of these values.  The following ciphers\nand cipher modes are impacted: RC2, RC4, RC5, CCM, GCM and OCB.\n\nFor the CCM, GCM and OCB cipher modes, truncation of the IV can result in\nloss of confidentiality.  For example, when following NIST's SP 800-38D\nsection 8.2.1 guidance for constructing a deterministic IV for AES in\nGCM mode, truncation of the counter portion could lead to IV reuse.\n\nBoth truncations and overruns of the key and overruns of the IV will\nproduce incorrect results and could, in some cases, trigger a memory\nexception.  However, these issues are not currently assessed as security\ncritical.\n\nChanging the key and/or IV lengths is not considered to be a common operation\nand the vulnerable API was recently introduced. Furthermore it is likely that\napplication developers will have spotted this problem during testing since\ndecryption would fail unless both peers in the communication were similarly\nvulnerable. For these reasons we expect the probability of an application being\nvulnerable to this to be quite low. However if an application is vulnerable then\nthis issue is considered very serious. For these reasons we have assessed this\nissue as Moderate severity overall.\n\nThe OpenSSL SSL/TLS implementation is not affected by this issue.\n\nThe OpenSSL 3.0 and 3.1 FIPS providers are not affected by this because\nthe issue lies outside of the FIPS provider boundary.\n\nOpenSSL 3.1 and 3.0 are vulnerable to this issue.",
          "Severity": "HIGH",
          "PackageList": [
            {
              "Name": "libcrypto3",
              "InstalledVersion": "3.0.8-r0",
              "FixedVersion": "3.0.12-r0"
            },
            {
              "Name": "libssl3",
              "InstalledVersion": "3.0.8-r0",
              "FixedVersion": "3.0.12-r0"
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
  ImageListForCVE(id: "CVE-2023-0464") {
    Results{
      RepoName
      Tag
      Digest
      LastUpdated
      IsSigned
      Size
      Vendor
      DownloadCount
      Licenses
      Title
      Manifests {
        Digest
        ConfigDigest
        Platform {
          Os
          Arch
        }
      }
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "ImageListForCVE": {
      "Results": [
        {
          "RepoName": "alpine",
          "Tag": "3.17",
          "Digest": "sha256:75bfe77c8d5a76b4421cfcebbd62a28ae70d10147578d0cda45820e99b0ef1d8",
          "LastUpdated": "2023-02-11T04:46:42.558343068Z",
          "IsSigned": true,
          "Size": "3375436",
          "Vendor": "",
          "DownloadCount": 0,
          "Licenses": "",
          "Title": "",
          "Manifests": [
            {
              "Digest": "sha256:75bfe77c8d5a76b4421cfcebbd62a28ae70d10147578d0cda45820e99b0ef1d8",
              "ConfigDigest": "sha256:6a2bcc1c7b4c9207f791a4512d7f2fa8fc2daeae58dbc51cb2797b05415f082a",
              "Platform": {
                "Os": "linux",
                "Arch": "amd64"
              }
            }
          ]
        },
      ]
    }
  }
}
```

### List images not affected by a given CVE id

**Sample request**

```graphql
{
  ImageListWithCVEFixed(id: "CVE-2023-0464", image: "ubuntu") {
    Results {
      RepoName
      Tag
      Digest
      LastUpdated
      Manifests {
        Digest
        ConfigDigest
      }
    }
  }
}
```

**Sample response**

```json
{
  "data": {
    "ImageListWithCVEFixed": {
      "Results": [
        {
          "RepoName": "ubuntu",
          "Tag": "kinetic",
          "Digest": "sha256:1ac35e499e330f6520e80e91b29a55ff298077211f5ed66aff5cb357cca4a28f",
          "LastUpdated": "2022-10-14T15:28:55.0263968Z",
          "Manifests": [
            {
              "Digest": "sha256:1ac35e499e330f6520e80e91b29a55ff298077211f5ed66aff5cb357cca4a28f",
              "ConfigDigest": "sha256:824c0269745923afceb9765ae24f5b331bb6fcf2a82f7eba98b3cfd543afb41e"
            }
          ]
        },
        {
          "RepoName": "ubuntu",
          "Tag": "kinetic-20220922",
          "Digest": "sha256:79eae04a0e32878fef3f8c5f901c32f6704c4a80b7f3fd9d89629e15867acfff",
          "LastUpdated": "2022-10-14T15:27:41.2144454Z",
          "Manifests": [
            {
              "Digest": "sha256:79eae04a0e32878fef3f8c5f901c32f6704c4a80b7f3fd9d89629e15867acfff",
              "ConfigDigest": "sha256:15c8dcf63970bb14ea36e41aa001b87d8d31e25a082bf6f659d12489d3e53d90"
            }
          ]
        }
      ]
    }
  }
}
```

### Search images by digest

**Sample request**

```graphql
{
  ImageListForDigest(
    id: "79eae04a0e32878fef3f8c5f901c32f6704c4a80b7f3fd9d89629e15867acfff"
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
    "ImageListForDigest": {
      "Results": [
        {
          "RepoName": "ubuntu",
          "Tag": "kinetic-20220922",
          "Title": "ubuntu"
        }
      ]
    }
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
    "ImageList": {
      "Results": [
        {
          "Tag": "jammy",
          "Digest": "sha256:f96fcb040c7ee00c037c758cf0ab40638e6ee89b03a9d639178fcbd0e7f96d27",
          "LastUpdated": "2022-10-14T15:29:18.0325322Z",
          "Size": "30472739"
        },
        {
          "Tag": "jammy-20221003",
          "Digest": "sha256:86681debca1719dff33f426a0f5c41792ebc52496c5d78a93b655b8b48fb71b2",
          "LastUpdated": "2022-10-14T15:29:07.0004587Z",
          "Size": "30472748"
        },
        {
          "Tag": "kinetic",
          "Digest": "sha256:1ac35e499e330f6520e80e91b29a55ff298077211f5ed66aff5cb357cca4a28f",
          "LastUpdated": "2022-10-14T15:28:55.0263968Z",
          "Size": "27498890"
        },
        {
          "Tag": "kinetic-20220922",
          "Digest": "sha256:79eae04a0e32878fef3f8c5f901c32f6704c4a80b7f3fd9d89629e15867acfff",
          "LastUpdated": "2022-10-14T15:27:41.2144454Z",
          "Size": "27498899"
        },
        {
          "Tag": "latest",
          "Digest": "sha256:9bc6d811431613bf2fd8bf3565b319af9998fc5c46304022b647c63e1165657c",
          "LastUpdated": "2022-10-14T15:26:59.6707939Z",
          "Size": "30472740"
        },
        {
          "Tag": "rolling",
          "Digest": "sha256:72e75626c5068b9d9a462c4fc80a29787d0cf61c8abc81bfd5ea69f6248d56fc",
          "LastUpdated": "2022-10-14T15:27:21.2441356Z",
          "Size": "30472741"
        }
      ]
    }
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
          "Tag": "jammy",
          "Digest": "sha256:f96fcb040c7ee00c037c758cf0ab40638e6ee89b03a9d639178fcbd0e7f96d27"
        },
        {
          "Tag": "jammy-20221003",
          "Digest": "sha256:86681debca1719dff33f426a0f5c41792ebc52496c5d78a93b655b8b48fb71b2"
        },
        {
          "Tag": "kinetic",
          "Digest": "sha256:1ac35e499e330f6520e80e91b29a55ff298077211f5ed66aff5cb357cca4a28f"
        },
        {
          "Tag": "kinetic-20220922",
          "Digest": "sha256:79eae04a0e32878fef3f8c5f901c32f6704c4a80b7f3fd9d89629e15867acfff"
        },
        {
          "Tag": "rolling",
          "Digest": "sha256:72e75626c5068b9d9a462c4fc80a29787d0cf61c8abc81bfd5ea69f6248d56fc"
        },
        {
          "Tag": "latest",
          "Digest": "sha256:9bc6d811431613bf2fd8bf3565b319af9998fc5c46304022b647c63e1165657c"
        }
      ],
      "Summary": {
        "LastUpdated": "2022-10-14T15:29:18.0325322Z",
        "Size": "58146896",
        "NewestImage": {
          "Tag": "jammy",
          "LastUpdated": "2022-10-14T15:29:18.0325322Z",
          "Digest": "sha256:f96fcb040c7ee00c037c758cf0ab40638e6ee89b03a9d639178fcbd0e7f96d27"
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
      Manifests {
        Digest
        Layers {
          Size
          Digest
        }
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
          "LastUpdated": "2022-10-14T15:26:59.6707939Z",
          "Manifests": [
            {
              "Digest": "sha256:9bc6d811431613bf2fd8bf3565b319af9998fc5c46304022b647c63e1165657c",
              "Layers": [
                {
                  "Size": "30428928",
                  "Digest": "sha256:cf92e523b49ea3d1fae59f5f082437a5f96c244fda6697995920142ff31d59cf"
                }
              ]
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

This query returns an `ImageSummary` for a specific `<repo>:<tag>` reference and can include image-level details (metadata, timestamps, security posture) as well as per-manifest details for multi-arch indexes.

**Sample query**

```graphql
{
  Image(image: "alpine:latest") {
    RepoName
    Tag
    Digest
    MediaType
    Size
    DownloadCount
    LastPullTimestamp
    PushTimestamp
    TaggedTimestamp
    LastUpdated
    Description
    Title
    Documentation
    Licenses
    Labels
    Source
    Vendor
    Authors
    IsSigned
    IsDeletable
    Vulnerabilities {
      MaxSeverity
      Count
      UnknownCount
      LowCount
      MediumCount
      HighCount
      CriticalCount
    }
    SignatureInfo {
      Tool
      IsTrusted
      Author
    }
    Referrers {
      MediaType
      ArtifactType
      Size
      Digest
      Annotations {
        Key
        Value
      }
    }
    Manifests {
      Digest
      ConfigDigest
      LastUpdated
      Size
      IsSigned
      DownloadCount
      ArtifactType
      Platform {
        Os
        Arch
      }
      SignatureInfo {
        Tool
        IsTrusted
        Author
      }
      Vulnerabilities {
        MaxSeverity
        Count
        UnknownCount
        LowCount
        MediumCount
        HighCount
        CriticalCount
      }
      Layers {
        Size
        Digest
      }
      History {
        Layer {
          Size
          Digest
        }
        HistoryDescription {
          Created
          CreatedBy
          Author
          Comment
          EmptyLayer
        }
      }
      Referrers {
        MediaType
        ArtifactType
        Size
        Digest
        Annotations {
          Key
          Value
        }
      }
    }
  }
}
```

#### Field significance

**Top-level identity and shape**

- **`RepoName`**: Repository name for the resolved image reference.
- **`Tag`**: Tag requested.
- **`Digest`**: Content digest of the resolved image manifest or index.
- **`MediaType`**: Media type of the resolved object (for example, manifest vs index).

**Sizes and popularity**

- **`Size`**: Size (bytes, as a string) of the resolved object. For an index, this reflects the index "total" computed by zot's search metadata.
- **`DownloadCount`**: Pull/download counter tracked by zot for the resolved image.

**Timestamps**

- **`LastPullTimestamp`**: Last time the image/tag was pulled (from zot's tracked statistics). If the image was never pulled (or pull stats are not available), zot may return the Unix epoch (`1970-01-01T00:00:00Z`) as a sentinel value.
- **`PushTimestamp`**: Time the manifest or index was pushed to the registry (from zot's tracked statistics).
- **`TaggedTimestamp`**: Time the **tag** was created or first observed for this digest. This differs from push time: a tag can be created later by re-tagging an existing digest. For older repositories created before zot persisted tag timestamps, zot may fall back to using `PushTimestamp`.
- **`LastUpdated`**: Effective "last updated" time for the image as seen by zot's search metadata. zot derives this from the image "created" timestamp when available (for example via the `org.opencontainers.image.created` annotation/label), and otherwise falls back to the OCI image config timestamps (`config.Created`, then the last entry in `config.History`).

**Descriptive metadata (from image annotations/labels when available)**

- **`Description`**, **`Title`**, **`Documentation`**, **`Licenses`**, **`Source`**, **`Vendor`**, **`Authors`**: Optional descriptive fields derived from image or index annotations/labels. These are useful for UI display and discovery.
- **`Labels`**: A string representing label "categories" derived from image and index metadata. It is populated from a dedicated label key (not individual label keys) and its exact formatting is defined by the image publisher (often a comma-separated list). When the image has no such categories, this value is an empty string (`""`), as shown in the sample response.

**Security and policy**

- **`IsSigned`**: Whether zot considers the image signed (based on discovered signatures or referrers).
- **`IsDeletable`**: Whether the image is eligible for deletion by the current user (subject to zot policy and internal constraints). This can be `null` when delete permission is not evaluated for the current query context.
- **`Vulnerabilities{...}`**: Aggregated vulnerability counts and severity for the image, when vulnerability scanning is enabled and data is available.
- **`SignatureInfo{Tool, IsTrusted, Author}`**: Signature tool and trust metadata for the resolved image, when available.

**Artifacts and referrers**

- **`Referrers{...}`**: Artifacts that refer to this image (SBOMs, signatures, attestations, etc.).
  - **`MediaType`**: Media type of the referrer manifest.
  - **`ArtifactType`**: OCI artifact type describing what the referrer is (for example, a signature or SBOM type).
  - **`Size`**, **`Digest`**: Referrer object size and digest.
  - **`Annotations{Key,Value}`**: OCI annotations on the referrer.

**Per-manifest details (`Manifests`)**

`Manifests` provides manifest-level details for the resolved image. For multi-arch images (OCI index), it contains one entry per platform. For single-arch images (OCI manifest), it typically contains a single entry describing that manifest (see the sample response below).

- **`Digest`**: Digest of the platform manifest.
- **`ConfigDigest`**: Digest of the image config referenced by the manifest.
- **`LastUpdated`**: Effective "last updated" time for this manifest summary. zot derives this from the manifest's "created" timestamp when available (for example via the `org.opencontainers.image.created` annotation/label), and otherwise falls back to the OCI image config timestamps (`config.Created`, then the last entry in `config.History`).
- **`Size`**: Size (bytes, as a string) of the manifest summary's content.
- **`Platform{Os, Arch}`**: Target platform for the manifest.
- **`ArtifactType`**: Artifact type associated with the manifest. For OCI artifacts, this is the OCI artifact type. For normal image manifests, this may be empty or derived from the config media type, as shown in the sample response.
- **`IsSigned`**, **`DownloadCount`**, **`SignatureInfo{...}`**, **`Vulnerabilities{...}`**: Same meaning as top-level fields, scoped to this manifest.
- **`Layers{Size, Digest}`**: Layer list and sizes (useful for troubleshooting size bloat and caching behavior).
- **`History{...}` / `HistoryDescription{...}`**: Image history entries (when present), including creation metadata and whether a layer is "empty".
- **`Referrers{...}`**: Referrers scoped to the specific manifest digest (can differ from index-level referrers).

**Sample response**

```json
{
  "data": {
    "Image": {
      "RepoName": "alpine",
      "Tag": "latest",
      "Digest": "sha256:85f2b723e106c34644cd5851d7e81ee87da98ac54672b29947c052a45d31dc2f",
      "MediaType": "application/vnd.oci.image.manifest.v1+json",
      "Size": "3804055",
      "DownloadCount": 0,
      "LastPullTimestamp": "1970-01-01T00:00:00Z",
      "PushTimestamp": "2026-02-02T14:42:05.849482664Z",
      "TaggedTimestamp": "2026-02-02T14:42:05.849482232Z",
      "LastUpdated": "2025-10-08T11:04:56Z",
      "Description": "",
      "Title": "",
      "Documentation": "",
      "Licenses": "",
      "Labels": "",
      "Source": "https://github.com/alpinelinux/docker-alpine.git#4dc13cbc7caffe03c98aa99f28e27c2fb6f7e74d:x86_64",
      "Vendor": "",
      "Authors": "",
      "IsSigned": false,
      "IsDeletable": null,
      "Vulnerabilities": {
        "MaxSeverity": "UNKNOWN",
        "Count": 14,
        "UnknownCount": 14,
        "LowCount": 0,
        "MediumCount": 0,
        "HighCount": 0,
        "CriticalCount": 0
      },
      "SignatureInfo": [],
      "Referrers": [],
      "Manifests": [
        {
          "Digest": "sha256:85f2b723e106c34644cd5851d7e81ee87da98ac54672b29947c052a45d31dc2f",
          "ConfigDigest": "sha256:706db57fb2063f39f69632c5b5c9c439633fda35110e65587c5d85553fd1cc38",
          "LastUpdated": "2025-10-08T11:04:56Z",
          "Size": "3804055",
          "IsSigned": false,
          "DownloadCount": 0,
          "ArtifactType": "application/vnd.oci.image.config.v1+json",
          "Platform": {
            "Os": "linux",
            "Arch": "amd64"
          },
          "SignatureInfo": [],
          "Vulnerabilities": {
            "MaxSeverity": "UNKNOWN",
            "Count": 14,
            "UnknownCount": 14,
            "LowCount": 0,
            "MediumCount": 0,
            "HighCount": 0,
            "CriticalCount": 0
          },
          "Layers": [
            {
              "Size": "3802452",
              "Digest": "sha256:2d35ebdb57d9971fea0cac1582aa78935adf8058b2cc32db163c98822e5dfa1b"
            }
          ],
          "History": [
            {
              "Layer": {
                "Size": "3802452",
                "Digest": "sha256:2d35ebdb57d9971fea0cac1582aa78935adf8058b2cc32db163c98822e5dfa1b"
              },
              "HistoryDescription": {
                "Created": "2025-10-08T11:04:56Z",
                "CreatedBy": "ADD alpine-minirootfs-3.22.2-x86_64.tar.gz / # buildkit",
                "Author": "",
                "Comment": "buildkit.dockerfile.v0",
                "EmptyLayer": false
              }
            },
            {
              "Layer": null,
              "HistoryDescription": {
                "Created": "2025-10-08T11:04:56Z",
                "CreatedBy": "CMD [\"/bin/sh\"]",
                "Author": "",
                "Comment": "buildkit.dockerfile.v0",
                "EmptyLayer": true
              }
            }
          ],
          "Referrers": []
        }
      ]
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