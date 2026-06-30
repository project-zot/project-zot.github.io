# Using Docker with zot

> :point_right: The Docker client has specific behaviors that differ from OCI-compliant clients. This article explains how to configure zot for Docker client compatibility, enable HTTPS, and troubleshoot Docker authentication issues.

zot is a pure OCI-native registry. The Docker client (`docker`) implements the OCI Distribution Specification but with several quirks that require extra configuration steps compared to fully OCI-compliant clients such as Podman or skopeo.

## Docker image format compatibility (compat mode)

By default, zot stores and serves images in [OCI Image Format](https://github.com/opencontainers/image-spec). When you push Docker-format manifests (`application/vnd.docker.distribution.manifest.v2+json`) to zot without compatibility mode, zot **rejects** the push unless `http.compat` is enabled.

When `http.compat` is **not** enabled, Docker-format images synced from upstream registries (Docker Hub, etc.) are automatically converted to OCI format during sync. Conversion changes the manifest digest, so digest-pinned pulls (`image@sha256:<digest>`) and verifiable signatures will not work as expected.

### When to enable compat mode

Enable `http.compat: ["docker2s2"]` in the zot configuration when any of the following apply:

- Clients push Docker-format manifests directly to zot and must be stored unchanged.
- Clients pull by digest (`image@sha256:<digest>`) and the digest must match the upstream registry.
- You mirror Docker-format images from upstream registries and need to keep manifests and digests unchanged (typically when using the `sync` extension with `preserveDigest: true`).
- You need cosign or notation signatures and referrers to remain valid after mirroring.

You can omit `compat` when:

- All images are already in OCI format.
- Clients pull by tag only and do not depend on digest stability.
- You use the `sync` extension with `preserveDigest: false` (the default) and accept that converted images will have different digests than upstream.

### Configuring compat mode

Add the `compat` attribute under `http` in the zot configuration file. The array must contain the exact string `docker2s2` (not `docker` or other aliases):

```json
"http": {
    "address": "0.0.0.0",
    "port": "5000",
    "compat": ["docker2s2"]
}
```

> :warning:
> If you enable `preserveDigest: true` in the `sync` extension, you **must** also set `http.compat: ["docker2s2"]`. zot refuses to start if `preserveDigest` is set without `http.compat`.

For mirroring use cases, combine `compat` with `onDemand: true` and `preserveDigest: true` in the sync extension:

```json
{
    "http": {
        "address": "0.0.0.0",
        "port": "5000",
        "compat": ["docker2s2"]
    },
    "extensions": {
        "sync": {
            "registries": [
                {
                    "urls": ["https://registry-1.docker.io"],
                    "onDemand": true,
                    "preserveDigest": true,
                    "content": [
                        {
                            "prefix": "**",
                            "destination": "/docker"
                        }
                    ]
                }
            ]
        }
    }
}
```

See [OCI Registry Mirroring With zot](mirroring.md) for a full mirroring configuration guide.

## HTTPS (TLS)

The Docker client requires HTTPS for any registry that is not `localhost` (or `127.0.0.1`). Attempting to use plain HTTP with a remote host results in an error such as:

```
Error response from daemon: Get "https://myreg.example.com/v2/": http: server gave HTTP response to HTTPS client
```

### Enabling TLS in zot

Configure TLS in the `http` section of the zot configuration file:

```json
"http": {
    "address": "0.0.0.0",
    "port": "443",
    "tls": {
        "cert": "/etc/zot/certs/server.crt",
        "key": "/etc/zot/certs/server.key"
    }
}
```

The certificate must be trusted by the Docker daemon. For production use, obtain a certificate from a public CA. For testing, you can use a self-signed certificate, but you must add it to Docker's trusted CA list (see [Docker documentation](https://docs.docker.com/engine/security/certificates/)) or add the registry to Docker's insecure registries.

### Insecure registries (testing only)

For local testing with plain HTTP or self-signed certificates, add the registry to Docker's `insecure-registries` list in `/etc/docker/daemon.json`:

```json
{
    "insecure-registries": ["myreg.example.com:5000"]
}
```

Then restart the Docker daemon. This is **not recommended for production**.

## Authentication

### How Docker authentication works

The Docker client determines whether to send credentials based on the response from the `/v2/` "ping" endpoint:

- If `/v2/` returns `200 OK`, Docker assumes the registry requires no authentication and does **not** send credentials on subsequent requests.
- If `/v2/` returns `401 Unauthorized` with a `WWW-Authenticate` header, Docker prompts for credentials or uses stored credentials from a prior `docker login`.

OCI-compliant clients such as Podman and skopeo handle per-resource authentication challenges correctly: they attempt the request first and then respond to the `401` challenge with credentials. Docker does not do this — it decides at `/v2/` ping time whether to send credentials at all.

### docker login

Before pushing or pulling from a zot registry that requires authentication, run:

```bash
docker login myreg.example.com
```

You will be prompted for a username and password. Docker stores the credentials and sends them on subsequent requests to that registry.

### Using API keys with docker login

When zot is configured with OpenID/OAuth2 authentication (`auth.openid`), interactive browser-based login is not available to the Docker CLI. Instead, use a **zot API key** as the password for `docker login`:

1. Log in to the zot web UI or API to generate an API key.
2. Use the API key as the password for `docker login`:

    ```bash
    docker login myreg.example.com -u <username> -p <api-key>
    ```

This stores the credentials so that subsequent `docker pull` and `docker push` commands work without re-authentication. See [User Authentication and Authorization with zot](authn-authz.md) for more information about API keys.

### Basic authentication (htpasswd or LDAP)

When zot is configured with `htpasswd` or `LDAP` authentication, use the configured username and password directly:

```bash
docker login myreg.example.com -u <username> -p <password>
```

## Mixed anonymous and authenticated access

A common configuration pattern is to allow unauthenticated (anonymous) read access to some repositories while requiring authentication to push or access private repositories. This is configured in zot using `anonymousPolicy` for some repositories and `defaultPolicy` or `adminPolicy` for others.

### The problem: Docker fails with "no basic auth credentials"

When a zot registry uses **basic authentication** (htpasswd or LDAP) **and** has a **mixed** access-control setup (at least one repository with `anonymousPolicy` alongside policies that require authentication, such as `defaultPolicy`, `adminPolicy`, or user-specific policies), unauthenticated Docker clients fail with:

```
Error response from daemon: Head "https://myreg.example.com/v2/repo/image/manifests/tag": no basic auth credentials
```

This happens because:

1. zot detects the mixed access-control configuration and returns `401 Unauthorized` on `/v2/` for Docker clients, to force them through the credential flow.
2. The Docker client, having received a `401` on `/v2/`, then sends all subsequent requests with credentials — but since it has none stored (from `docker login`), the request fails.

This behavior was introduced intentionally to fix a separate issue: without this workaround, Docker clients could not access protected repositories at all when any anonymous repository existed.

> :pencil2: This behavior only affects the Docker client. Podman, skopeo, and other OCI-compliant clients handle per-resource `401` challenges correctly and are not affected.

### Example: configuration that triggers this behavior

```json
{
    "http": {
        "address": "0.0.0.0",
        "port": "5000",
        "compat": ["docker2s2"],
        "realm": "zot",
        "auth": {
            "apikey": true,
            "openid": {
                "providers": {
                    "oidc": {
                        "credentialsFile": "/etc/zot/oidc-credentials.json",
                        "issuer": "https://sso.example.com/application/o/zot/",
                        "scopes": ["openid", "profile", "email"]
                    }
                }
            }
        },
        "accessControl": {
            "repositories": {
                "**": {
                    "anonymousPolicy": ["read"],
                    "defaultPolicy": ["read"]
                }
            },
            "adminPolicy": {
                "users": ["admin"],
                "actions": ["read", "create", "update", "delete"]
            }
        }
    }
}
```

In this configuration, any Docker client that has not previously run `docker login` will fail to pull, even for repositories that are marked as anonymous-readable.

### Solutions and workarounds

**Option 1: `docker login` with an API key (recommended)**

The simplest workaround is to log in with a zot API key before using the Docker client:

```bash
docker login myreg.example.com -u <username> -p <api-key>
```

After login, the Docker client stores the credentials and sends them automatically. Repositories with `anonymousPolicy` that allow read access continue to work; protected repositories are also accessible with the provided credentials.

**Option 2: Use Podman or skopeo**

[Podman](https://podman.io/) and [skopeo](https://github.com/containers/skopeo) handle per-resource authentication challenges natively and work correctly with mixed anonymous/authenticated zot configurations without requiring `podman login` first:

```bash
podman pull myreg.example.com/public-repo/image:tag
skopeo copy docker://myreg.example.com/public-repo/image:tag dir:/tmp/image
```

**Option 3: Use zot-docker-proxy**

[zot-docker-proxy](https://github.com/project-zot/zot-docker-proxy) is a proxy that sits in front of zot and handles Docker client quirks automatically, including proper anonymous access.

**Option 4: Avoid mixed access policies with basic auth**

Restructure the access control to avoid mixing anonymous policies with authenticated policies when using basic auth. For example:

- Use a fully public registry (all repositories `anonymousPolicy: ["read"]`) — Docker receives `200` on `/v2/` and can pull without credentials.
- Use a fully private registry (no `anonymousPolicy`) with bearer token authentication, which does not trigger the Docker compatibility workaround.

**Option 5: Switch to bearer token authentication**

The Docker compatibility workaround is only triggered with **basic** authentication (htpasswd or LDAP). If you use bearer token authentication, the `/v2/` endpoint behaves normally and Docker can use standard per-resource auth challenges.

## Summary: Docker client checklist

| Requirement | zot Configuration |
|-------------|-------------------|
| Push/pull Docker-format images | `"http": { "compat": ["docker2s2"] }` |
| Mirror from Docker Hub with digest preservation | `http.compat` + `sync.preserveDigest: true` |
| HTTPS for remote registry | `http.tls.cert` and `http.tls.key` |
| Docker push/pull with username/password | `auth.htpasswd` or `auth.ldap` + `docker login` |
| Docker push/pull with OpenID/OIDC | `auth.openid` + `auth.apikey: true` + `docker login` with API key |
| Anonymous pull + protected push (Docker) | `docker login` with credentials, or use Podman/skopeo |

## Related documentation

- [User Authentication and Authorization with zot](authn-authz.md)
- [Configuring zot](../admin-guide/admin-configuration.md)
- [OCI Registry Mirroring With zot](mirroring.md)
- [_containerd_ Mirroring From _zot_](containerd.md)
