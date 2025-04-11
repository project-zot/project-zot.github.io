# [_containerd_](https://containerd.io/) Mirroring From _zot_

> :point_right: _containerd_ supports registry mirroring and _zot_ can be used as an upstream registry to mirror from.

If your images are in a repository named _docker_ in the _zot_ registry and you
want _containerd_ to pull and mirror images from this repository, then your
_containerd_ configuration would look like the following.

## _containerd_ v1.x

The registry mirror configuration is specified inline as the plugin.

```
version = 2

[plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
endpoint = ['https://<my zot instance>:8080/v2/docker']
```

Note that _/v2_ is required for this to work.

## _containerd_ v2.x

The registry mirror configuration has changed in v2.x and now follows a
directory structure. The following example shows how _zot_ can be used as the default mirror registry.

```
version = 3

[plugins."io.containerd.cri.v1.images".registry]
  config_path = "/etc/containerd/certs.d"
```

```
$ tree /etc/containerd/certs.d
```

```
/etc/containerd/certs.d/
└── _default
    └── hosts.toml
```

```
$ cat /etc/containerd/certs.d/_default/hosts.toml
```

```
# zot is running at localhost:8080
server = "http://localhost:8080"

```

More information about various mirror registry configuration options is available [here](https://github.com/containerd/containerd/blob/main/docs/hosts.md#registry-configuration---examples).
