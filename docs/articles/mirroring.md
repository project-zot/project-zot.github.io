# Setup OCI Registry Mirror Using `zot`

One of the key use cases that zot enables is mirroring which uses the `sync` feature.
As long as upstream registries are OCI dist-spec conformant with regards to
pulling image content, we can use `zot` as a downstream mirror.

Similar to git where every clone is a full repository, you can setup a local
zot instance to be a full OCI registry and allows for a fully distributed
disconnected container image build pipeline.

OCI images and corresponding artifacts can move from one registry to another.

# Single Upstream

https://github.com/project-zot/zot/blob/main/examples/config-sync-localhost.json

# Multiple Upstream

https://github.com/project-zot/zot/blob/main/examples/config-sync.json

# `dockerhub` Mirror

Polling is not supported since dockerhub doesn't support catalog listing. So only on-demand is supported.


# Configuration Params


		"sync": {
			"enable": true,
			"credentialsFile": "./examples/sync-auth-filepath.json",
			"registries": [
				{
					"urls": [
						"https://registry1:5000"
					],
					"onDemand": false,
					"pollInterval": "6h",
					"tlsVerify": true,
					"certDir": "/home/user/certs",
					"maxRetries": 3,
					"retryDelay": "5m",
					"onlySigned": true,
					"content": [
						{
							"prefix": "/repo1/repo",
							"tags": {
								"regex": "4.*",
								"semver": true
							}
						},
						{
							"prefix": "/repo2/repo",
							"destination": "/repo2",
							"stripPrefix": true
						},
						{
							"prefix": "/repo3/repo"
						}
					]

## Parameters:

- credentialsFile - path to a file containing registries with username and password for auth
eg.
```
{
    "127.0.0.1:8080": {
        "username": "user",
        "password": "pass"
    },
    "registry2:5000": {
        "username": "user2",
        "password": "pass2"
    }
}
```

- urls - list of urls to the same registry, if the main one fails sync will backoff to the rest of urls one by one.
- onDemand - if set to true, whenever someone asks for an image that the registry doesn't have, sync will pull it from one of the registries in sync config, then it will serve it to the client.
- pollInterval - if set (together with "content") then periodically sync will be enabled and it will run every "pollInterval" value
- tlsVerify - whether or not to verify tls (default is true)
- certDir - use certificates (*.crt, *.cert, *.key) at path to connect to the destination registry or daemon.
- maxRetries and retryDelay, every call to the upstream registry will be retried for "maxRetries" times with a delay of "retryDelay"
- onlySigned - do not sync unsigned images (notation and cosign)

- content is a list of content filtering options (will filter both periodically and ondemand syncing).
  - prefix can be string that exactly match repositories or they can be [glob](https://en.wikipedia.org/wiki/Glob_(programming)) patterns.
  - tags.regex: filtering by tag regex, pull only tags that matches the regex
  - tags.semver: pull only tags that are semver compliant
  - destination - where to put synced repos (relative to zot's rootDir)
  - stripPrefix - will strip "prefix" before putting the image in destination (glob patterns like * and ** will not be stripped)



For the previous config this will be the logic:
1. sync only signed images (notation and cosign) securely using certDir to connect to "https://registry1:5000" at every 6 hours. OnDemand (mirroring) is disabled.
2. based on content filtering options it will sync the next images:
- /repo1/repo with tags that are starting with "4." and are semver compliant and store them as /repo1/repo on localhost
- /repo2/repo with all tags and put them into /repo2 (because of stripPrefix)
  so docker://upstream/repo2/repo:v1 will be docker://local/repo2:v1
- /repo3/repo with all tags and store them as /repo3/repo on localhost

concrete example

```
{
    "distSpecVersion": "1.0.1",
    "storage": {
        "rootDirectory": "/tmp/zot",
        "gc": true
    },
    "http": {
        "address": "0.0.0.0",
        "port": "8080"
    },
    "log": {
        "level": "debug"
    },
    "extensions": {
        "sync": {
            "enable": true,
            "registries": [
                {
                    "urls": [
                        "https://k8s.gcr.io"
                    ],
                    "content": [{"prefix": "**", "destination": "/k8s-images"}],
                    "onDemand": true,
                    "tlsVerify": true
                },
                {
                    "urls": [
                        "https://docker.io/library"
                    ],
                    "content": [{"prefix": "**", "destination": "/docker-images"}],
                    "onDemand": true,
                    "tlsVerify": true
                }
            ]
        }
    }
}
```

1) skopeo copy --src-tls-verify=false docker://localhost:8080/docker-images/alpine <dest>
will sync docker.io/library/alpine:latest to localhost:8080/docker-images/alpine:latest

2) skopeo copy --src-tls-verify=false docker://localhost:8080/k8s-images/kube-proxy:v1.19.2 <dest>
will sync k8s.gcr.io/kube-proxy:v1.19.2 to localhost:8080/k8s-images/kube-proxy:v1.19.2

curl http://localhost:8080/v2/_catalog
{"repositories":["docker-images/alpine","k8s-images/kube-proxy"]}


# `subPaths` Support

{
    "distSpecVersion": "1.0.1",
    "storage": {
        "subPaths":{
            "/kube-proxy":{
                "rootDirectory": "/tmp/kube-proxy",
                "dedupe": true,
                "gc": true
              }
          },
        "rootDirectory": "/tmp/zot",
        "gc": true
    },
    "http": {
        "address": "0.0.0.0",
        "port": "10015"
    },
    "log": {
        "level": "debug"
    },
    "extensions": {
        "sync": {
            "enable": true,
            "registries": [
                {
                    "urls": [
                        "https://k8s.gcr.io"
                    ],
                    "content": [{"destination": "/kube-proxy", "prefix": "**"}],
                    "onDemand": true,
                    "tlsVerify": true,
                    "maxRetries": 2,
                    "retryDelay": "5m"
                }
            ]
        }
    }
}


1) skopeo copy --src-tls-verify=false docker://localhost:8080/kube-proxy/kube-proxy:v1.19.2 <dest>
will sync k8s.gcr.io/kube-proxy:v1.19.2 into localhost:8080/kube-proxy/kube-proxy:v1.19.2

curl http://localhost:8080/v2/_catalog
{"repositories":["docker-images/alpine","k8s-images/kube-proxy","kube-proxy/kube-proxy"]}

the repo will be find in /tmp/zot/kube-proxy/kube-proxy/kube-proxy/
 - /tmp/kube-proxy rootDir +
 - kube-proxy sync destination +
 - kube-proxy repoName

