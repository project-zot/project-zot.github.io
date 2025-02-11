# [_containerd_](https://containerd.io/) Mirroring From _zot_

> :point_right: _containerd_ supports registry mirroring and _zot_ can be used as an upstream registry to mirror from.

If your images are in a repository named _docker_ in the _zot_ registry and you
want _containerd_ to pull and mirror images from this repository, then your
_containerd_ configuration would look like the following. Note that _/v2_ is
required for this to work.


```
[plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
endpoint = ['https://<my zot instance>:8080/v2/docker']
```
