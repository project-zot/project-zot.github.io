# User Authentication and Authorization with zot

> :point_right: A robust set of authentication/authorization options are supported:
>
> -   Authentication
>
>    -   TLS, including mTLS
>    -   Username/password or token-based user authentication
>    -   LDAP
>     -   htpasswd
> 
> -   Authorization
>
>     -   Powerful identity-based access controls for repositories or specific repository paths


The zot configuration model supports both authentication and authorization. Authentication credentials allow access to zot HTTP APIs. Authorization policies provide fine-grained control of the actions each authenticated user can perform in the registry.

## Authentication

### TLS authentication

Because authentication credentials are passed over HTTP, it is imperative that TLS be enabled. You can enable and configure TLS authentication in the zot configuration file, as shown in the following example.

``` json
"http": {
...
  "tls": {
    "cert": "/etc/zot/certs/server.cert",
    "key": "/etc/zot/certs/server.key"
  }
```

See [Mutual TLS authentication](#mtls-authentication) for additional information about TLS.

### HTTP basic authentication

When [basic HTTP authentication](https://www.rfc-editor.org/rfc/rfc7617.html) is used, the username and password credentials are joined by a colon (`:`), base64 encoded, and passed in the HTTP Authorization header.

### HTTP bearer authentication

To avoid passing the username and password credentials for every HTTP request, a zot client can use [bearer token-based authentication](https://www.rfc-editor.org/rfc/rfc6750). In this method, the client first authenticates with a token server and receives a short-lived token. The client then passes this token in the HTTP Authorization header, specifying `Bearer` as the authentication scheme.

Configure bearer authentication in the zot configuration file as shown in this example.

    "http": {
    ...
      "auth": {
        "bearer": {
          "realm": "https://auth.myreg.io/auth/token",
            "service": "myauth",
            "cert": "/etc/zot/auth.crt"
        }
      }

The following table lists the configurable attributes.

| Attribute | Description                                                                     |
|-----------|---------------------------------------------------------------------------------|
| `realm`   | A string typically related to the authentication scheme (*BASIC* and *BEARER*). |
| `service` | The name of the authentication service.                                         |
| `cert`    | The path and filename of the server’s SSL/TLS certificate.                      |

<a name="mtls-authentication"></a>
## Mutual TLS authentication

zot supports basic TLS and password-less mutual TLS authentication (mTLS). Specifying a `cacert` file in the TLS section of the zot configuration file enables mTLS. The `cacert` parameter is used to validate the client-side TLS certificates.

    "http": {
    ...
      "tls": {
        "cert": "/etc/zot/certs/server.cert",
        "key": "/etc/zot/certs/server.key",
        "cacert": "/etc/zot/certs/ca.cert"
      }

The following table lists the configurable attributes.

| Attribute | Description                                                                                                           |
|-----------|-----------------------------------------------------------------------------------------------------------------------|
| `cert`    | The path and filename of the server’s SSL/TLS certificate.                                                            |
| `key`     | The path and filename of the server’s registry key.                                                                   |
| `cacert`  | The path and filename of the server’s `cacerts` file, which contains trusted certificate authority (CA) certificates. |

### Preventing automated attacks with failure delay

To help prevent automated attacks, you can add a delayed response to an
authentication failure. Configure the `failDelay` attribute in the
configuration file as shown in the following example.

``` json
"http": {
  "auth": {
    "failDelay": 5
  }
}
```

The `failDelay` attribute specifies a waiting time, in seconds, before zot sends a failure notification to an authenticating user who has been denied access.

## Server-side authentication

You can implement server-side authentication for zot using `htpasswd` or LDAP or both.

> :pencil2: 
> When both `htpasswd` and LDAP configuration are specified, LDAP authentication is given preference. Because `htpasswd` authentication is strictly local and requires no remote service, `htpasswd` serves as a fail-safe authentication mechanism should LDAP become unavailable.

### LDAP

zot supports integration with an LDAP-based authentication service such as Microsoft Windows Active Directory (AD). Enable and configure LDAP authentication in the zot configuration file, as shown in the following example.

``` json
"http": {
...
  "auth": {
    "ldap": {
      "address": "ldap.example.org",
      "port": 389,
      "startTLS": false,
      "baseDN": "ou=Users,dc=example,dc=org",
      "userAttribute": "uid",
      "bindDN": "cn=ldap-searcher,ou=Users,dc=example,dc=org",
      "bindPassword": "ldap-searcher-password",
      "skipVerify": false,
      "subtreeSearch": true
    }
  }
}
```

The following table lists the configurable attributes for LDAP
authentication.

| Attribute       | Description                                                                      |
|-----------------|----------------------------------------------------------------------------------|
| `address`       | The IP address or hostname of the LDAP server.                                   |
| `port`          | The port number used by the LDAP service.                                        |
| `startTLS`      | Set to `true` to enable TLS communication with the LDAP server.                  |
| `baseDN`        | Starting location within the LDAP directory for performing user searches.        |
| `userAttribute` | Attribute name used for a user.                                                  |
| `bindDN`        | Base Distinguished Name for the LDAP search.                                     |
| `bindPassword`  | Password of the bind LDAP user.                                                  |
| `skipVerify`    | Skip TLS verification.                                                           |
| `subtreeSearch` | Set to `true` to expand the scope for search to include subtrees of the base DN. |

### htpasswd

Enable and configure `htpasswd` authentication in the zot
configuration file, as shown in the following example.

1.  Create and store an `htpasswd` file on the server.

        $ htpasswd -bBn <username> <password> >> /etc/zot/htpasswd

2.  Enable `htpasswd` authentication and configure the path to the
    `htpasswd` authentication in the zot configuration file.

    ``` json
    "http": {
    ...
      "auth": {
          "htpasswd": {
            "path": "/etc/zot/htpasswd"
          },
    ```

    The `path` attribute specifies the path and filename of the
    `htpasswd` file, which contains user names and hashed passwords.

## Authorization

With an access scheme that relies solely on authentication, any authenticated user would be given complete access to the registry. To better control access, zot supports identity-based repository-level access control (authorization) policies. The access control policy is a function of _repository_, _user_ and _action_ being performed on that repository.

### Access control policies

Four types of access control policies are supported:

| Policy type   | Access allowed                                                                                                                                                                       |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Default (`defaultPolicy`)       | The default policy specifies what actions are allowed if a user is authenticated but doesn't match any user-specific policy.                                                            |
| User-specific | A user-specific policy allows for certain users to override the default policy by specifying access and actions for explicitly named users.                                                                                                      |
| Anonymous (`anonymousPolicy`)     | An anonymous policy specifies what an unauthenticated user is allowed to do. This is an appropriate policy when you want to grant open read-only access to one or more repositories. |
| Admin (`adminPolicy`)        | The admin policy is a global access control policy that grants privileges to perform actions on any repository.                                                                      |

The underlying rationale is that access is organized along repositories, users and their actions. Most users for a particular repository will have similar access control requirements and hence fall under the `defaultPolicy`. There could be a few users as exceptions who will require a user-specific override. Some repositories can additionally allow anonymous actions which do not require authentication. Finally, some users can be specified to be administrators and the global administrator policy applies.

### Configuring access control

User identity can be used as an authorization criterion for allowing actions on one or more repository paths. For specific users, you can choose to allow any combination of read, create, update, or delete actions on specific paths.

When you define policies for specific repository paths, the paths can be specified explicitly or by using `glob` patterns with simple or recursive wildcards. When a repository path matches more than one path description, authorization is granted based on the policy of the longest (most specific) path matched. For example, if policies are defined for path descriptions `**` and `repos2/repo,` the `repos2/repo` path will match both `**` and `repos2/repo` descriptions. In this case, the `repos2/repo` policy will be applied because it is longer.

Note that `**` effectively defines the default policy, as it matches any path not matched by any other per-repository policy. To override all other policies, you can specify a global admin policy.

> :pencil2:
> Always include the read action in any policy that you define. The create, update, and delete actions cannot be used without the read action.


### Example: Access control configuration

Use the `accessControl` attribute in the configuration file to define a set of identity-based authorization policies, as shown in the following example.

``` json
"http": {
...
  "accessControl": {
    "**": {
      "policies": [{
        "users": ["charlie"],
        "actions": ["read", "create", "update"]
      }],
      "defaultPolicy": ["read", "create"]
    },
    "tmp/**": {
      "defaultPolicy": ["read", "create", "update"]
    },
    "infra/*": {
      "policies": [{
          "users": ["alice", "bob"],
          "actions": ["create", "read", "update", "delete"]
        },
        {
          "users": ["mallory"],
          "actions": ["create", "read"]
        }
      ],
      "defaultPolicy": ["read"]
    },
    "repos2/repo": {
      "policies": [{
          "users": ["bob"],
          "actions": ["read", "create"]
        },
        {
          "users": ["mallory"],
          "actions": ["create", "read"]
        }
      ],
      "defaultPolicy": ["read"]
    },
    "adminPolicy": {
      "users": ["admin"],
      "actions": ["read", "create", "update", "delete"]
    }
  }
```

In this example, five policies are defined:

-   The default policy (`**`) gives all users the ability to read or
    create content, while giving user "charlie" the additional ability
    to update content.

-   The policy for `tmp/**` matches all repositories under `tmp`
    recursively and allows all users to read, create, or update content
    in those repositories.

-   The policy for `infra/*` matches all repositories directly under
    `infra.` Separate policies are defined for specific users, along
    with a default read-only policy for all other users.

-   The policy for `repos2/repo` matches only that specific repository.

-   An admin policy (`adminPolicy`) gives the user "admin" global
    authorization to read, create, update, or delete content in any
    repository, overriding all other policies.
