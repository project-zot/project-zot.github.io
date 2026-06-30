# Docker Users Guide to zot

> :point_right: This guide is for users coming from the Docker ecosystem. It covers everything you need to know to push images, pull images, configure mirrors, and handle authentication with a zot registry using the Docker CLI.

zot is a pure OCI-native registry built entirely on the [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec). The Docker CLI (`docker`) can push and pull images to and from zot, but the Docker client has several quirks and assumptions that differ from fully OCI-compliant clients such as Podman or skopeo. This guide explains those differences and how to configure zot to work well with Docker.

## Quick start

The steps below get you from zero to `docker pull` from a zot registry:

1. **Deploy zot** — see [Installing zot on Bare Metal Linux](../install-guides/install-guide-linux.md) or [Installing zot with Kubernetes and Helm](../install-guides/install-guide-k8s.md).
2. **Enable TLS** — the Docker client requires HTTPS for any remote registry. See [HTTPS and TLS](#https-and-tls).
3. **Enable Docker image format support** if you intend to push Docker-format images or use zot as a mirror for Docker Hub. See [Docker image format compatibility](#docker-image-format-compatibility-compat-mode).
4. **Log in** — run `docker login <registry>`. See [Authentication](#authentication).
5. **Push and pull** — use standard `docker push` and `docker pull` commands.

## HTTPS and TLS

The Docker daemon requires HTTPS for any registry that is not `localhost` (or `127.0.0.1`). Using plain HTTP results in an error such as:

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

The certificate must be trusted by the Docker daemon on the client machine. For production use, obtain a certificate from a public CA or your organization's internal CA. See [User Authentication and Authorization with zot](authn-authz.md#tls-authentication) for more detail.

### Insecure registries (local testing only)

For local testing with a plain-HTTP registry or a self-signed certificate, add the registry address to the Docker `insecure-registries` list in `/etc/docker/daemon.json` on the client machine, then restart the Docker daemon:

```json
{
    "insecure-registries": ["myreg.example.com:5000"]
}
```

> :warning: Do not use insecure registries in production.

## Authentication

### How Docker authentication works

The Docker client decides whether to send credentials based on the `/v2/` "ping" response from the registry:

- `200 OK` → Docker assumes no authentication is required and sends no credentials on subsequent requests.
- `401 Unauthorized` with `WWW-Authenticate` → Docker retrieves stored credentials (from a previous `docker login`) and sends them on subsequent requests.

OCI-compliant clients (Podman, skopeo) handle per-resource `401` challenges inline — they attempt a request, receive a `401`, and retry with credentials. Docker does not do this, so it must have credentials stored at login time for protected repositories.

### docker login

Before pushing to or pulling from a protected zot registry, log in:

```bash
docker login myreg.example.com
```

You will be prompted for your username and password. Docker stores the credentials in `~/.docker/config.json` and sends them automatically on subsequent requests.

To log out and remove the stored credentials:

```bash
docker logout myreg.example.com
```

### htpasswd and LDAP (basic authentication)

When zot is configured with `htpasswd` or LDAP authentication, use your configured username and password directly with `docker login`:

```bash
docker login myreg.example.com -u alice
```

Docker prompts for a password. For non-interactive use, pipe the password via `--password-stdin` instead of passing it on the command line to avoid exposing it in shell history:

```bash
echo "mypassword" | docker login myreg.example.com -u alice --password-stdin
```

For information on configuring htpasswd or LDAP in zot, see [User Authentication and Authorization with zot](authn-authz.md#server-side-authentication).

### OpenID/OAuth2 with API keys

When zot is configured with OpenID/OAuth2 authentication (`auth.openid`), browser-based login is not available to the Docker CLI. Instead, enable API keys in zot and use an API key as the password for `docker login`:

1. Enable API keys in zot configuration:

    ```json
    "http": {
        "auth": {
            "apikey": true,
            "openid": { ... }
        }
    }
    ```

2. Log in to the zot web UI (`https://myreg.example.com`) with your OpenID provider and generate an API key.

3. Use the API key as the password for `docker login`. Pass it via `--password-stdin` to avoid exposing it in shell history:

    ```bash
    echo "<api-key>" | docker login myreg.example.com -u <username> --password-stdin
    ```

After this, `docker push` and `docker pull` work as normal with the stored credentials. See [User Authentication and Authorization with zot](authn-authz.md) for full details on OpenID and API key configuration.

## Docker image format compatibility (compat mode)

By default, zot stores images in [OCI Image Format](https://github.com/opencontainers/image-spec). Pushing a Docker-format manifest (`application/vnd.docker.distribution.manifest.v2+json`) without compatibility mode enabled is rejected by zot.

### When to enable compat mode

Enable `http.compat: ["docker2s2"]` when any of the following apply:

- You push Docker-format images directly to zot (for example, `docker push` without buildx OCI mode).
- You mirror Docker Hub or other Docker-format registries and need to preserve the original manifests and digests (required when using `preserveDigest: true` in the `sync` extension).
- Clients pull by digest (`image@sha256:<digest>`) and the digest must match the upstream registry.
- You need cosign or notation signatures tied to the original digest to remain valid after mirroring.

You can omit `compat` when all images are OCI-formatted and clients pull by tag only, accepting that converted images may have different digests than the upstream source.

### Configuring compat mode

Add the `compat` attribute under `http` in the zot configuration file. The array must contain the exact string `docker2s2`:

```json
"http": {
    "address": "0.0.0.0",
    "port": "5000",
    "compat": ["docker2s2"]
}
```

> :warning:
> If you use `preserveDigest: true` in the `sync` extension, you **must** also set `http.compat: ["docker2s2"]`. zot refuses to start if `preserveDigest` is configured without `http.compat`.

See [Configuring zot](../admin-guide/admin-configuration.md#compat_config) and [OCI Registry Mirroring With zot](mirroring.md) for more detail.

## Mixed anonymous and authenticated access

A common configuration is to allow unauthenticated read access for public repositories while requiring authentication to push or access private ones. In zot this is done with `anonymousPolicy` on some repositories alongside `defaultPolicy` or `adminPolicy` for others.

### The problem

When zot uses **basic authentication** (htpasswd, LDAP, or API keys) **and** has a **mixed** access-control setup — at least one repository with `anonymousPolicy` alongside any policy that requires authentication — Docker clients that have not run `docker login` fail with:

```
Error response from daemon: Head "https://myreg.example.com/v2/repo/image/manifests/tag": no basic auth credentials
```

**Why this happens:** With a mixed access-control setup, zot returns `401 Unauthorized` on the `/v2/` ping for Docker clients so they use their stored credentials on protected repositories. The Docker client sees the `401` on `/v2/` and looks for stored credentials — but if `docker login` has not been run, it has none and fails.

> :pencil2: This behavior only affects the Docker client. Podman, skopeo, and other OCI-compliant clients handle per-resource `401` challenges natively and are not affected.

### Example configuration that triggers this behavior

```json
{
    "http": {
        "address": "0.0.0.0",
        "port": "5000",
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

In this configuration, any Docker client that has not previously run `docker login` will fail to pull even from repositories that allow anonymous reads.

### Solutions

**Option 1: `docker login` with an API key (recommended)**

Run `docker login` once with a zot API key. Pass the key via `--password-stdin` to avoid exposing it in shell history:

```bash
echo "<api-key>" | docker login myreg.example.com -u <username> --password-stdin
```

After storing credentials, `docker pull` works for both public and private repositories. No further login steps are needed unless the API key expires.

**Option 2: Use Podman or skopeo**

Podman and skopeo handle per-resource authentication challenges natively:

```bash
podman pull myreg.example.com/public-repo/image:tag
skopeo copy docker://myreg.example.com/public-repo/image:tag dir:/tmp/image
```

These clients work with anonymous-readable repositories without requiring a login step.

**Option 3: Use zot-docker-proxy**

[zot-docker-proxy](https://github.com/project-zot/zot-docker-proxy) is a proxy that sits in front of zot and transparently handles Docker client quirks including anonymous access.

**Option 4: Avoid mixed policies**

The mixed-policy issue affects all basic-authentication setups (htpasswd, LDAP, and API keys). Avoiding `anonymousPolicy` entirely — or running separate zot instances for public and private content — eliminates the issue without requiring a login step.

## Using zot as a Docker pull-through cache

zot can serve as a pull-through cache (on-demand mirror) for Docker Hub and other upstream registries. This reduces external network traffic and speeds up image pulls in your environment.

### Docker daemon registry mirror configuration

Configure the Docker daemon to use zot as a mirror for `docker.io` by editing `/etc/docker/daemon.json` on each Docker host:

```json
{
    "registry-mirrors": ["https://myreg.example.com"]
}
```

Restart the Docker daemon after saving the file:

```bash
sudo systemctl restart docker
```

After this, `docker pull ubuntu:22.04` first checks zot for a cached copy; if not present, zot fetches it from Docker Hub and caches it for subsequent pulls.

> :pencil2: For zot to serve as a pull-through cache for Docker Hub images, configure the `sync` extension with `onDemand: true`. Enable `http.compat: ["docker2s2"]` and `preserveDigest: true` if you need to preserve Docker image digests.

For a full zot mirror configuration, see [OCI Registry Mirroring With zot](mirroring.md).

### Docker with containerd image store (Docker Engine 25+ / containerd v2.x)

Docker Engine 25 and later can use the containerd image store (`containerd-snapshotter`), which supports the same `hosts.toml`-based registry mirror configuration as containerd itself. When this feature is enabled, Docker reads registry mirror configuration from `/etc/docker/certs.d/` rather than from `daemon.json`.

> :pencil2: Check whether the containerd image store is enabled on your Docker host:
> ```bash
> docker info | grep "Storage Driver"
> ```
> If the output shows `overlayfs` (containerd image store), `hosts.toml` configuration applies.

For each upstream registry you want to mirror through zot, create a directory under `/etc/docker/certs.d/` named after the upstream registry and place a `hosts.toml` file inside it.

**Example directory structure** for mirroring several public registries:

```
/etc/docker/certs.d/
├── docker.io
│   └── hosts.toml
├── gcr.io
│   └── hosts.toml
├── ghcr.io
│   └── hosts.toml
├── mcr.microsoft.com
│   └── hosts.toml
├── public.ecr.aws
│   └── hosts.toml
├── quay.io
│   └── hosts.toml
├── registry.gitlab.com
│   └── hosts.toml
└── registry.k8s.io
    └── hosts.toml
```

**Example: mirroring `quay.io` through zot**

Assume zot is running at `https://myreg.example.com` and the zot `sync` extension mirrors `quay.io` images into the `/quay` repository prefix (that is, `destination: "/quay"` in the sync configuration).

Create `/etc/docker/certs.d/quay.io/hosts.toml`:

```toml
server = "https://quay.io"

[host."https://myreg.example.com/v2/quay"]
  capabilities = ["pull", "resolve"]
  override_path = true
```

Key points:

- The `server` field is the canonical upstream registry URL. Docker falls back to it if the mirror is unavailable.
- The host key uses the full path including `/v2/<destination-prefix>` because the zot OCI Distribution API is rooted at `/v2/`.
- `override_path = true` is required when the mirror path differs from the upstream path (that is, when `destination` is set to something other than `/`).
- `capabilities` should include `pull` and `resolve`; add `push` only if you also want `docker push` to go to zot.

For the `docker.io` mirror, if you sync Docker Hub images to a `/docker` prefix in zot:

```toml
server = "https://registry-1.docker.io"

[host."https://myreg.example.com/v2/docker"]
  capabilities = ["pull", "resolve"]
  override_path = true
```

No Docker daemon restart is required when you add or modify `hosts.toml` files — changes take effect on the next pull.

For more information about `hosts.toml` configuration options, see the [containerd registry configuration documentation](https://github.com/containerd/containerd/blob/main/docs/hosts.md#registry-configuration---examples).

## Summary: Docker client configuration checklist

| Goal | Configuration |
|------|---------------|
| Push/pull Docker-format images | `"http": { "compat": ["docker2s2"] }` |
| Use HTTPS (required for non-localhost) | `http.tls.cert` and `http.tls.key` |
| Authenticate with username/password | `auth.htpasswd` or `auth.ldap` + `docker login` |
| Authenticate with OpenID/OIDC | `auth.openid` + `auth.apikey: true` + `docker login` with API key |
| Pull anonymous repos when mixed auth is enabled | `docker login` first, or use Podman/skopeo |
| Mirror Docker Hub with digest preservation | `http.compat: ["docker2s2"]` + `sync.preserveDigest: true` |
| Docker daemon pull-through cache | `registry-mirrors` in `/etc/docker/daemon.json` |
| Docker+containerd image store mirrors | `hosts.toml` in `/etc/docker/certs.d/<registry>/` |

## Related documentation

- [User Authentication and Authorization with zot](authn-authz.md)
- [Configuring zot](../admin-guide/admin-configuration.md)
- [OCI Registry Mirroring With zot](mirroring.md)
- [_containerd_ Mirroring From _zot_](containerd.md)
- [Push and Pull Image Content](../user-guides/user-guide-datapath.md)
