# User Authentication and Authorization with zot

> :point_right: A robust set of authentication/authorization options are supported:
>
> -   Authentication
>
>     -   TLS, including mTLS
>     -   Username/password or token-based user authentication
>     -   LDAP
>     -   htpasswd
>     -   OAuth2 with bearer token
> 
> -   Authorization
>
>     -   Powerful identity-based access controls for repositories or specific repository paths
>     -   OpenID/OAuth2 social login with Google, GitHub, GitLab, and dex


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
      "credentialsFile": "examples/config-ldap-credentials.json",
      "address": "ldap.example.org",
      "port": 389,
      "startTLS": false,
      "baseDN": "ou=Users,dc=example,dc=org",
      "userAttribute": "uid",
      "userGroupAttribute": "memberOf",
      "bindDN": "cn=ldap-searcher,ou=Users,dc=example,dc=org",
      "bindPassword": "ldap-searcher-password",
      "skipVerify": false,
      "subtreeSearch": true
    }
  }
}
```

The following table lists the configurable attributes for LDAP authentication.

| Attribute       | Description                                                                      |
|-----------------|----------------------------------------------------------------------------------|
| `credentialsFile` | The path to a file containing the bind credentials for LDAP.                   |
| `address`       | The IP address or hostname of the LDAP server.                                   |
| `port`          | The port number used by the LDAP service.                                        |
| `startTLS`      | Set to `true` to enable TLS communication with the LDAP server.                  |
| `baseDN`        | Starting location within the LDAP directory for performing user searches.        |
| `userAttribute` | Attribute name used to obtain the username.                                      |
| `userGroupAttribute` | Attribute name used to obtain groups to which a user belongs.               |
| `skipVerify`    | Skip TLS verification.                                                           |
| `subtreeSearch` | Set to `true` to expand the scope for search to include subtrees of the base DN. |


To allow for separation of configuration and credentials, the credentials for the LDAP server are specified in a separate file, as shown in the following example. 

``` json
{
  "bindDN":"cn=ldap-searcher,ou=Users,dc=example,dc=org",
  "bindPassword":"ldap-searcher-password"
}
```

The following table lists the configurable attributes of the LDAP credentials file.

| Attribute       | Description                                                                      |
|-----------------|----------------------------------------------------------------------------------|
| `bindDN`        | Base Distinguished Name for the LDAP search.                                     |
| `bindPassword`  | Password of the bind LDAP user.                                                  |


### htpasswd

Enable and configure `htpasswd` authentication in the zot
configuration file, as shown in the following example.

1.  Create and store an `htpasswd` file on the server.

        $ htpasswd -bBn <username> <password> >> /etc/zot/htpasswd

    :pencil2: For strong security, make sure to use the -B option, specifying the bcrypt hashing algorithm. This is the only algorithm supported by zot for `htpasswd`.

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

    The `path` attribute specifies the path and filename of the `htpasswd` file, which contains user names and hashed passwords. 

## Authorization

With an access scheme that relies solely on authentication, any authenticated user would be given complete access to the registry. To better control access, zot supports identity-based repository-level access control (authorization) policies. The access control policy is a function of _repository_, _user_, and the _action_ being performed on that repository.

### Access control policies

Five identity-based types of access control policies are supported:

| Policy type   | Attribute | Access allowed |
|---------------|-----------|-----|
| Default       | `defaultPolicy` | The default policy specifies what actions are allowed if a user is authenticated but does match any user-specific policy. |
| User-specific | `users`, `actions` | A user-specific policy specifies access and actions for explicitly named users. |
| Group-specific | `groups`, `actions` | A group-specific policy specifies access and actions for explicitly named groups. |
| Anonymous     | `anonymousPolicy` | An anonymous policy specifies what an unauthenticated user is allowed to do. This is an appropriate policy when you want to grant open read-only access to one or more repositories. |
| Admin         | `adminPolicy` | The admin policy is a global access control policy that grants privileges to perform actions on any repository.  |

Access control is organized by repositories, users, and their actions. Most users of a particular repository will have similar access control requirements and can be served by a repository-specific `defaultPolicy`. Should a user require an exception to the default policy, a user-specific or group-specific override policy can be configured. 

With an `anonymousPolicy`, a repository can allow anonymous actions which do not require user authentication. Finally, one or more users can be designated as administrators, to whom the global `adminPolicy` applies.

A user's access to a particular repository is evaluated first by whether a user-specific policy exists, then by group-specific policies, and then (in order) by default and admin policies.

A group-specific policy can be applied within any type of access policy, including default or admin policies. The group policy name can also be used with LDAP.

#### Configuring access control

User identity or group identity can be used as an authorization criterion for allowing actions on one or more repository paths. For specific users, you can choose to allow any combination of read, create, update, or delete actions on specific paths.

When you define policies for specific repository paths, the paths can be specified explicitly or by using `glob` patterns with simple or recursive wildcards. When a repository path matches more than one path description, authorization is granted based on the policy of the longest (most specific) path matched. For example, if policies are defined for path descriptions `**` and `repos2/repo,` the `repos2/repo` path will match both `**` and `repos2/repo` descriptions. In this case, the `repos2/repo` policy will be applied because it is longer.

Note that `**` effectively defines the default policy, as it matches any path not matched by any other per-repository policy. To override all other policies, you can specify a global admin policy.

> :pencil2:
> Always include the read action in any policy that you define. The create, update, and delete actions cannot be used without the read action.


#### Example: Access control configuration

Use the `accessControl` attribute in the configuration file to define a set of identity-based authorization policies, as shown in the following example.

``` json
"http": {
...
  "accessControl": {
    "groups": {
      "group1": {
        "users": ["bob", "mary"]
      },
      "group2": {
        "users": ["alice", "mallory", "jim"]
      }
    },
    "repositories": {
      "**": {
        "policies": [{
          "users": ["charlie"],
          "groups": ["group2"],
          "actions": ["read", "create", "update"]
        }],
        "defaultPolicy": ["read", "create"]
      },
      "tmp/**": {
        "anonymousPolicy": ["read"],
        "defaultPolicy": ["read", "create", "update"]
      },
      "infra/*": {
        "policies": [{
            "users": ["alice", "bob"],
            "actions": ["create", "read", "update", "delete"]
          },
          {
            "users": ["mallory"],
            "groups": ["group1"],
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
      }
    },
    "adminPolicy": {
      "users": ["admin"],
      "actions": ["read", "create", "update", "delete"]
    }
  }
```

In this example, five policies are defined:

-   The default policy (`**`) gives all authenticated users the ability to read or create content, while giving user "charlie" and those in "group2" the additional ability to update content.

-   The policy for `tmp/**` matches all repositories under `tmp` recursively and allows all authenticated users to read, create, or update content in those repositories. Unauthenticated users have read-only access to these repositories.

-   The policy for `infra/*` matches all repositories directly under `infra.` Separate policies are defined for specific users, along with a default read-only policy for all other users.

-   The policy for `repos2/repo` matches only that specific repository.

-   An admin policy (`adminPolicy`) gives the user "admin" global authorization to read, create, update, or delete content in any repository, overriding all other policies.

:pencil2:  In releases prior to zot v2.0.0, authorization policies were defined directly under the `accessControl` key in the zot configuration file.  Beginning with v2.0.0, the set of authorization policies are now defined under a new `repositories` key.

<a name="_social-login"></a>

### Social login using OpenID/OAuth2 

Social login is an authentication/authorization method in which your existing credentials for another site or service can be used to log in to a service such as zot. For example, you can log in to zot using your GitHub account credentials, and zot will contact GitHub to verify your identity using OAuth 2.0 and [OpenID Connect (OIDC)](https://openid.net/connect/) protocols. 

Several social login providers are supported by zot:

- github
- google
- gitlab
- oidc (for example, dex)

The following example shows the zot configuration for these providers:

``` json
{
  "http": {
    "auth": {
      "openid": {
        "providers": {
          "github": {
            "clientid": <client_id>,
            "clientsecret": <client_secret>,
            "scopes": ["read:org", "user", "repo"]
          },
          "google": {
            "issuer": "https://accounts.google.com",
            "clientid": <client_id>,
            "clientsecret": <client_secret>,
            "scopes": ["openid", "email"]
          },
          "gitlab": {
            "issuer": "https://gitlab.com",
            "clientid": <client_id>,
            "clientsecret": <client_secret>,
            "scopes": ["openid", "read_api", "read_user", "profile", "email"]
          },
          "oidc": {
            "issuer": "http://<zot-server>:5556/dex",
            "clientid": <client_id>,
            "clientsecret": <client_secret>,
            "keypath": "",
            "scopes": ["openid", "profile", "email", "groups"]
          }
        }
      }
    }
  }
}
```

#### Using Google, GitHub, or GitLab

A client logging into zot by social login must specify a supported OpenID/OAuth2 provider as a URL query parameter.  A client logging in using Google, GitHub, or GitLab must additionally specify a callback URL for redirection to a zot page after a successful authentication. 

The login URL using Google, GitHub, or GitLab uses the following format:

    http://<zot-server>/auth/login?provider=<provider>&callback_ui=<zot-server>/<page>

For example, a user logging in to the zot home page using GitHub as the authentication provider sends this URL:

    http://zot.example.com:8080/auth/login?provider=github&callback_ui=http://zot.example.com:8080/home

Based on the specified provider, zot redirects the login to a provider service with the following URL:

    http://<zot-server>/zot/auth/callback/<provider>

For the GitHub authentication example:

    http://zot.example.com:8080/zot/auth/callback/github

:pencil2: If your network policy doesn't allow inbound connections, the callback will not work and this authentication method will fail.

#### Using dex

[dex](https://dexidp.io/) is an identity service that uses OpenID Connect (OIDC) to drive authentication for client apps, such as zot. While this section shows how to use dex with zot, zot supports other OIDC services as well.

Like zot, dex uses a configuration file for setup. To specify zot as a client in dex, configure a `staticClients` entry in the dex configuration file with a zot callback, such as the following example in the dex configuration file:

```yaml
staticClients:
  - id: zot-client
    redirectURIs:
      - 'http://zot.example.com:8080/zot/auth/callback/oidc'
    name: 'zot'
    secret: ZXhhbXBsZS1hcHAtc2VjcmV0
```

In the zot configuration file, configure dex as an OpenID auth provider as in the following example:

```json
  "http": {
    "auth": {
      "openid": {
        "providers": {
          "oidc": {
            "name": "Corporate SSO",
            "issuer": "http://<zot-server>:5556/dex",
            "clientid": "zot-client",
            "clientsecret": "ZXhhbXBsZS1hcHAtc2VjcmV0",
            "keypath": "",
            "scopes": ["openid", "profile", "email", "groups"]
          }
        }
      }
    }
  }
```

A user logging in to zot using dex OpenID authentication sends a URL with dex as a URL query parameter, such as the following example:

`http://zot.example.com:8080/auth/login?provider=oidc`

For detailed information about configuring dex service, see the dex [Getting Started](https://dexidp.io/docs/getting-started/) documentation.


#### Using OpenID/OAuth2 when zot is behind a proxy or load balancer

When the zot registry is running behind a proxy or load balancer, you must provide an external URL for OpenID/OAuth2 clients to redirect back to zot. This `externalUrl` attribute is the URL of the registry, as shown in this example:

```json
  "http": {
    "address": "0.0.0.0",
    "port": "8080",
    "externalUrl": "https://zot.example.com",
    "auth": {
      "openid": {
        "providers": {
          "github": {
            "clientid": <client_id>,
            "clientsecret": <client_secret>,
            "scopes": ["read:org", "user", "repo"]
          }
        }
      }
    }
  }
```
